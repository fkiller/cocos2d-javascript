#!/usr/bin/env python

from optparse import OptionParser
from cStringIO import StringIO
import re, os, base64

class Builder(object):

    required_files = []
    loaded_files = []


    def build(self, source, output=None):
        code = self.parse(source)
        if output:
            o = open(output, 'w')
            o.write(code)
            o.close()
        else:
            return code


    def parse(self, source):
        #print "Parsing file: %s" % source
        code = open(source).read()
        old_dir = os.getcwd()

        if source[0] == '/':
            code_dir = os.path.dirname(source)
        else:
            code_dir = old_dir + '/' + os.path.dirname(source)

        os.chdir(code_dir)
        code = self.parse_requires(code)

        os.chdir(code_dir)
        code = self.parse_imports(code)

        os.chdir(code_dir)
        code = self.parse_loads(code)

        os.chdir(old_dir)
        code = self.parse_supers(code)

        os.chdir(old_dir)
        code = self.parse_base64(code)

        return code + '\n'

    def parse_base64(self, code):
        """
        Parses @base64 tags to emebed binary data.
        """
        def replace_base64(matches):
            binary_filename = os.getcwd() + '/' + matches.group('filename')
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



    def parse_loads(self, code):
        """
        Parses @load tags.
        A @load imports an app and wraps the whole thing in a function/namespace.
        """
        def replace_load(matches):
            load_filename = '../apps/' + matches.group('filename') + '/main.js'
            print "Loading app: %s" % load_filename

            # If already loadd, don't include it again
            if load_filename in self.loaded_files:
                return ''

            self.loaded_files.append(load_filename)

            code = '''
(function() {
%s
})()
            ''' % self.parse(load_filename)
            return code

        load_re = re.compile('''@load\s+(?P<q>"|')(?P<filename>.+)(?P=q)\s*;?''')
        return load_re.sub(replace_load, code)

    def parse_requires(self, code):
        """
        Parses @require tags.
        A @require is only included once. If you attempt to @require a file
        more than once, then subsequent attempts will be ignored.
        """
        def replace_require(matches):
            require_filename = os.getcwd() + '/' + matches.group('filename')
            print "Requiring: %s" % require_filename

            # If already required, don't include it again
            if require_filename in self.required_files:
                return ''

            self.required_files.append(require_filename)

            return self.parse(require_filename)

        require_re = re.compile('''@require\s+(?P<q>"|')(?P<filename>.+)(?P=q)\s*;?''')
        return require_re.sub(replace_require, code)

    def parse_imports(self, code):
        """
        Parses @import tags.
        @import works a lot like @require but will import a file every time it's used.
        It is possible to cause infinite import loops using this.
        """
        def replace_import(matches):
            import_filename = matches.group('filename')
            return self.parse(import_filename)

        import_re = re.compile('''@import\s+(?P<q>"|')(?P<filename>.+)(?P=q)\s*;?''')
        return import_re.sub(replace_import, code)



def main():
    parser = OptionParser()
    parser.add_option("-f", "--file", dest="output",
                      help="write code to FILE", metavar="FILE")

    parser.add_option("-s", "--source", dest="input",
                      help="build source code in SRC. Default is main.js", metavar="SRC")

    (options, args) = parser.parse_args()

    builder = Builder()
    builder.build(options.input or 'main.js', options.output)

if __name__ == "__main__":
    main()


# vim:fenc=utf-8:et:sw=4:ts=4:sts=4
