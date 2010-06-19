#!/usr/bin/env python

from optparse import OptionParser
from cStringIO import StringIO
import re, os, base64, mimetypes, json

mimetypes.add_type('application/xml', '.tmx')
mimetypes.add_type('application/xml', '.tsx')

TEXT_MIMETYPES = 'application/xml text/plain text/json application/json text/javascript application/javascript text/html'.split(' ')

SOURCE_CODE_TEMPLATE = '''
window.__source_files__["%s"] = (function() {
    var exports = {};
    var __filename = window.__filename;
    var __dirname = window.__dirname;

    (function() {

%s
    }).call(exports);
    return exports;
});
'''

BINARY_RESOURCE_TEMPLATE = '''
window.__resources__["%s"] = "data:%s;base64,%s";
'''
TEXT_RESOURCE_TEMPLATE = '''
window.__resources__["%s"] = %s;
'''

class Builder(object):

    required_files = []
    loaded_files = []


    def build(self, source, output=None):
        code = open('system.js').read()
        for root, dirs, files in os.walk(source):
            if re.match(r".*/resources($|/)", root):
                for f in files:
                    if f[0] == '.':
                        continue
                    path = os.path.join(root, f)
                    resources_name = './%s' % path[len(source) +1:] # Remove source path prefix
                    mimetype = mimetypes.guess_type(path)[0]
                    data = StringIO()

                    is_binary = (mimetype not in TEXT_MIMETYPES)

                    if is_binary:
                        base64.encode(open(path), data)
                        code += BINARY_RESOURCE_TEMPLATE % (resources_name, mimetype, data.getvalue().replace('\n', ''))
                    else:
                        code += TEXT_RESOURCE_TEMPLATE % (resources_name, json.dumps(open(path).read()))
            else:
                for f in files:
                    if f[-3:] != '.js':
                        continue
                    path = os.path.join(root, f)
                    script_name = './%s' % path[len(source) +1:] # Remove source path prefix

                    file_code = open(path).read()
                    file_code = self.parse_supers(file_code)
                    file_code = self.parse_base64(file_code, root)

                    code += SOURCE_CODE_TEMPLATE % (script_name, file_code)


        code += '\n' + open(source + '/main.js').read()

        if output:
            o = open(output, 'w')
            o.write(code)
            o.close()
        else:
            return code

    def include_script(root, filename):
        pass

    def parse(self, code):
        code = self.parse_supers(code)
        code = self.parse_base64(code)

        return code

    def parse_base64(self, code, root=''):
        """
        Parses @base64 tags to emebed binary data.
        """
        def replace_base64(matches):
            binary_filename = root + '/' + matches.group('filename')
            print "Embedding: %s" % binary_filename

            mimetype = 'image/png'
            data = StringIO()
            base64.encode(open(binary_filename), data)

            return '"data:%s;base64,%s"' % (mimetype, data.getvalue().replace('\n', ''))


        load_re = re.compile('''@base64\s*\(\s*(?P<q>"|')(?P<filename>.+)(?P=q)\s*\)?''')
        return load_re.sub(replace_base64, code)

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

    builder = Builder()
    print builder.build(options.input or 'src', options.output)

if __name__ == "__main__":
    main()


# vim:fenc=utf-8:et:sw=4:ts=4:sts=4
