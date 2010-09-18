#!/usr/bin/env python

from optparse import OptionParser
from cStringIO import StringIO
import re, os, base64, mimetypes, json

TEXT_MIMETYPES = 'application/xml text/plain text/json application/json text/html'.split(' ')
CODE_MIMETYPES = 'text/javascript application/javascript'.split(' ')

IMAGE_RESOURCE_TEMPLATE  = '\nwindow.__resources__["%s"] = {meta: {mimetype: "%s"}, data: __imageResource("data:%s;base64,%s")};\n'
BINARY_RESOURCE_TEMPLATE = '\nwindow.__resources__["%s"] = {meta: {mimetype: "%s"}, data: "%s"};\n'
TEXT_RESOURCE_TEMPLATE   = '\nwindow.__resources__["%s"] = {meta: {mimetype: "%s"}, data: %s};\n'
CODE_RESOURCE_TEMPLATE   = '''
window.__resources__['%s'] = {meta: {mimetype: "%s"}, data: function(exports, require, module, __filename, __dirname) {
%s
}};
'''

mimetypes.add_type('application/xml', '.tmx')
mimetypes.add_type('application/xml', '.tsx')

class Compiler:
    def make(self, source, strip_source=True):
        code = '''
if (!window.__resources__) { window.__resources__ = {}; }
function __imageResource(data) {
    var img = new Image();
    img.src = data;

    return img;
}
'''

        source = os.path.normpath(source)

        for root, dirs, files in os.walk(source):
            for f in files:
                if f[0] == '.':
                    continue
                path = os.path.join(root, f)

                if strip_source:
                    resource_name = '/%s' % path[len(source) +1:] # Remove source path prefix
                else:
                    resource_name = '/%s' % path


                mimetype = mimetypes.guess_type(path)[0]

                is_code = (mimetype in CODE_MIMETYPES)
                is_text = (mimetype in TEXT_MIMETYPES)
                is_image = (mimetype.split('/')[0] == 'image')

                data = StringIO()

                if is_code:
                    file_code = open(path).read()
                    file_code = self.parse_supers(file_code)
                    code += CODE_RESOURCE_TEMPLATE % (resource_name, mimetype, file_code)
                elif is_text:
                    code += TEXT_RESOURCE_TEMPLATE % (resource_name, mimetype, json.dumps(open(path).read()))
                elif is_image:
                    base64.encode(open(path), data)
                    code += IMAGE_RESOURCE_TEMPLATE % (resource_name, mimetype, mimetype, data.getvalue().replace('\n', ''))
                else: # Binaries
                    base64.encode(open(path), data)
                    code += BINARY_RESOURCE_TEMPLATE % (resource_name, mimetype, mimetype, data.getvalue().replace('\n', ''))

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
    parser.add_option("-f", "--file", dest="output",
                      help="write code to FILE", metavar="FILE")

    parser.add_option("-s", "--source", dest="input",
                      help="build source code in SRC. Default is src", metavar="SRC")

    (options, args) = parser.parse_args()

    compiler = Compiler()
    code = compiler.make(options.input)
    if options.output:
        o = open(options.output, 'w')
        o.write(code)
        o.close()
    else:
        print code

if __name__ == "__main__":
    main()
    
