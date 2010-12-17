#!/usr/bin/env python

from optparse import OptionParser
from cStringIO import StringIO
import re, os, base64, mimetypes, codecs
try:
    import json
except:
    import simplejson as json

TEXT_MIMETYPES = 'application/xml text/plain text/json application/json text/html'.split(' ')
CODE_MIMETYPES = 'text/javascript application/javascript'.split(' ')

IMAGE_RESOURCE_TEMPLATE  = u'\nwindow.__resources__["%s"] = {meta: {mimetype: "%s"}, data: __imageResource("data:%s;base64,%s")};\n'
BINARY_RESOURCE_TEMPLATE = u'\nwindow.__resources__["%s"] = {meta: {mimetype: "%s"}, data: "%s"};\n'
TEXT_RESOURCE_TEMPLATE   = u'\nwindow.__resources__["%s"] = {meta: {mimetype: "%s"}, data: %s};\n'
CODE_RESOURCE_TEMPLATE   = u'''
window.__resources__['%s'] = {meta: {mimetype: "%s"}, data: function(exports, require, module, __filename, __dirname) {
%s
}};
'''

mimetypes.add_type('application/xml', '.tmx')
mimetypes.add_type('application/xml', '.tsx')
mimetypes.add_type('application/xml', '.plist')

class Compiler:
    config = None
    output = 'cocos2d.js'
    main_module = 'main'
    header_code = u''
    footer_code = u''
    valid_extensions = None

    def __init__(self, config_file=None):
        self.config = self.load_config(config_file)

        module_js = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'module.js')
        self.footer_code = open(module_js).read()
        self.header_code = u'''
if (!window.__resources__) { window.__resources__ = {}; }
if (!window.__imageResource) { window.__imageResource = function(data) { var img = new Image(); img.src = data; return img; }; }
var __main_module_name__ = %s
''' % json.dumps(self.main_module)

    def load_config(self, config_file):
        print "Loading config:", config_file
        f = open(config_file, 'r')
        config = json.loads(f.read())
        self.output = config['output']
        self.main_module = config['main_module'] or 'main'
        self.valid_extensions = config['extensions']

        return config
        
    def make(self):
        code = self.header_code
        for source, dest in self.config['paths'].items():
            code += self.make_path(source, root_path=dest, include_header=False, include_footer=False)
        code += self.footer_code
        return code


    def make_path(self, source, strip_source=True, root_path='/', include_header=True, include_footer=False):
        print "Building:", source
        if not include_header:
            code = ''
        else:
            code = self.header_code

        source = os.path.normpath(source)

        # If refrences to a single file we won't bother walking
        if os.path.isfile(source):
            f = source
            if self.valid_extensions and os.path.splitext(f)[1][1:] not in self.valid_extensions:
                print "Skipping:", f
                return

            if strip_source: # Remove source path prefix
                resource_name = '%s%s' % (root_path, f[len(source) +1:])
            else:
                resource_name = '%s%s' % (root_path, f)

            code += self.read_file(f, resource_name)

        else: # If it's a directory we'll include everything in it
            for root, dirs, files in os.walk(source):
                for f in files:
                    if f[0] == '.':
                        continue

                    path = os.path.join(root, f)

                    if strip_source: # Remove source path prefix
                        resource_name = '%s%s' % (root_path, path[len(source) +1:])
                    else:
                        resource_name = '%s%s' % (root_path, path)

                    code += self.read_file(path, resource_name)



        if include_footer:
            code += self.footer_code

        return code

    def read_file(self, filename, resource_name):
        if self.valid_extensions and os.path.splitext(filename)[1][1:] not in self.valid_extensions:
            print "Skipping:", filename
            return ''

        print "Reading: '%s' --> '%s'" % (filename, resource_name)

        mimetype = mimetypes.guess_type(filename)[0]

        is_code = (mimetype in CODE_MIMETYPES)
        is_text = (mimetype in TEXT_MIMETYPES)
        is_image = (mimetype.split('/')[0] == 'image')

        data = StringIO()

        if is_code:
            file_code = codecs.open(filename, encoding='utf-8').read()
            file_code = self.parse_supers(file_code)
            code = CODE_RESOURCE_TEMPLATE % (resource_name, mimetype, file_code)
        elif is_text:
            code = TEXT_RESOURCE_TEMPLATE % (resource_name, mimetype, json.dumps(open(filename).read()))
        elif is_image:
            base64.encode(open(filename), data)
            code = IMAGE_RESOURCE_TEMPLATE % (resource_name, mimetype, mimetype, data.getvalue().replace('\n', ''))
        else: # Binaries
            base64.encode(open(filename), data)
            code = BINARY_RESOURCE_TEMPLATE % (resource_name, mimetype, mimetype, data.getvalue().replace('\n', ''))

        return code

    def parse_supers(self, code):
        """
        Changes:
            @super('foo', 'bar');
            @super()
            @super

        Into:
            arguments.callee.base.call(this, 'foo', 'bar');
            arguments.callee.base.call(this);
            arguments.callee.base.apply(this, arguments);
        """

        def replace_super_apply(matches):
            return '%sarguments.callee.base.apply(this, arguments);' % (matches.group('indent'))

        def replace_super(matches):
            args = ''
            if matches.group('args'):
                args = ', %s' % matches.group('args')

            return '%sarguments.callee.base.call(this%s);' % (matches.group('indent'), args)

        super_re = re.compile('''(?P<indent>[ \t]*)@super\((?P<args>.*)\)\s*;''')
        code = super_re.sub(replace_super, code)

        super_re = re.compile('''(?P<indent>[ \t]*)@super\s*;''')
        code = super_re.sub(replace_super_apply, code)

        return code


def main():
    parser = OptionParser()
    parser.add_option("-c", "--config", dest="config",
                      help="configuration file. Default is make.js", metavar="CONFIG")

    parser.add_option("-f", "--file", dest="output",
                      help="write code to FILE. Overrides config file", metavar="FILE")

    parser.add_option("-s", "--source", dest="input",
                      help="compile everything in SRC. Config is ignored if specified", metavar="SRC")

    (options, args) = parser.parse_args()

    compiler = Compiler(options.config or 'make.js')

    if options.input:
        code = compiler.make_path(options.input)
    else:
        code = compiler.make()

    output = options.output or compiler.output
    if output:
        print "Writing output to:", output
        o = codecs.open(output, 'w', encoding='utf-8')
        o.write(code)
        o.close()
    else:
        print code

if __name__ == "__main__":
    main()
    
