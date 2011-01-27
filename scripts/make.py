#!/usr/bin/env python

from optparse import OptionParser
from cStringIO import StringIO
from string import Template
import re, os, base64, mimetypes, codecs
try:
    import json
except:
    import simplejson as json

mimetypes.add_type('application/xml', '.tmx')
mimetypes.add_type('application/xml', '.tsx')
mimetypes.add_type('application/xml', '.plist')

TEXT_MIMETYPES = 'application/xml text/plain text/json application/json text/html'.split(' ')
CODE_MIMETYPES = 'text/javascript application/javascript application/x-javascript'.split(' ')

RESOURCE_TEMPLATE   = Template(u'__resources__["$resource"] = {meta: {mimetype: "$mimetype"}, data: $data};')

class Compiler(object):
    config = None
    output = 'cocos2d.js'
    main_module = 'main'
    extensions = ['js', 'tmx', 'tms', 'plist', 'gif', 'jpg', 'jpeg', 'png']
    header = u''
    footer = u''

    def __init__(self, config='make.js'):
        self.config = self.read_config(config)
        print "Ouputting to: ", self.output

    def read_config(self, config_file):
        print "Loading config:", config_file
        f = codecs.open(config_file, 'r', encoding='utf-8')
        config = self.read_json_file(config_file)
        self.output = config['output']
        self.main_module = config['main_module'] or 'main'
        self.extensions = config['extensions']

        return config

    def make(self):
        """
        Compile everything into a single script
        """
        code = self.header

        # Prepend app globals needed for resources
        code += '\n(function() {\n'
        code += 'var __main_module_name__ = %s;\n' % json.dumps(self.main_module)
        code += 'var __resources__ = [];\n'
        code += 'function __imageResource(data) { var img = new Image(); img.src = data; return img; };\n'
        for key, val in self.app_config_dict().items():
            code += 'var %s = %s;\n' % (key.upper(), json.dumps(val))


        # Add all the code
        for source, dest in self.config['paths'].items():
            code += self.make_path(source, dest)


        # Append module.js file -- this handles all the module loading
        module_js_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'module.js')
        code += codecs.open(module_js_path, 'r', encoding='utf-8').read()

        code += '\n})();\n'

        code += self.footer

        return code


    def make_path(self, source_path, dest_path=None):
        """
        Compile everything at a path and return the code
        """
        if not dest_path:
            dest_path = source_path 
        print 'Building Path:', source_path, ' => ', dest_path
        
        code = ''
        files = self.scan_for_files(source_path)
        for src_file in files:
            if src_file in self.app_configs():
                # Skip config files because they're JSON not JavaScript
                continue

            dst_file = self.dst_for_src(src_file)
            mimetype = mimetypes.guess_type(src_file)[0]
            
            print 'Building File:', src_file, ' => ', dst_file
            code += '\n';
            code += RESOURCE_TEMPLATE.substitute({
                'mimetype': mimetype,
                'resource': dst_file,
                'data': self.make_resource(src_file),
            })

        return code

    def dst_for_src(self, path):
        for source, dest in self.config['paths'].items():
            if path.startswith(source):
                return re.sub('\/+', '/', re.sub(r'^' + source.replace('/', '\\/'), dest, path))

        return path

    def app_configs(self):
        """
        Returns an array of paths pointing to all the config.js files for the app
        """
        configs = [u'src/libs/cocos2d/config.js']
        for source, dest in self.config['paths'].items():
            c = os.path.join(source, 'config.js')
            if os.path.exists(c):
                configs.append(c)

        return configs

            

    def app_config_dict(self):
        """
        Reads all the app's config.js files and returns a dictionary of their values
        """
        vals = {}
        for config in self.app_configs():
            data = self.read_json_file(config)
            vals.update(data)


        return vals
        
    def read_json_file(self, path):
        j = codecs.open(path, 'r', encoding='utf-8').read()

        # Strip comments
        j = re.sub(r"\/\/.*", '', j)
        j = re.sub(re.compile(r"\/\*.*?\*\/", re.DOTALL), '', j)

        # Fix unquoted keys
        j = re.sub(r"{\s*(\w)", r'{"\1', j)
        j = re.sub(r",\s*(\w)", r',"\1', j)
        j = re.sub(r"(\w):", r'\1":', j)

        # Fix trailing comma
        j = re.sub(re.compile(r",\s+}", re.DOTALL), '}', j)

        return json.loads(j)


    def scan_for_files(self, path):
        """
        Scan for files to build and return them as an array
        """
        if os.path.isfile(path):
            return [path]

        found_files = []

        for root, dirs, files in os.walk(path):
            for f in files:
                if f[0] == '.':
                    # Skip hidden files
                    continue

                if self.extensions and os.path.splitext(f)[1][1:] not in self.extensions:
                    # Unwanted file extension
                    continue

                full_path = os.path.join(root, f)
                found_files.append(full_path)
                    
        return found_files

        

    def make_resource(self, filename):
        """
        Returns a resource string for adding to the __resources__ global
        """

        mimetype = mimetypes.guess_type(filename)[0]

        is_code = (mimetype in CODE_MIMETYPES)
        is_text = (mimetype in TEXT_MIMETYPES)
        is_image = (mimetype.split('/')[0] == 'image')

        if is_code:
            data = codecs.open(filename, 'r', encoding='utf-8').read()
            data = self.parse_supers(data)
            # Wrap code in function
            data = "function(exports, require, module, __filename, __dirname) {\n%s\n}" % data
        elif is_text:
            data = codecs.open(filename, 'r', encoding='utf-8').read()
            # Escape text by converting to json
            data = json.dumps(data)
        elif is_image:
            data = open(filename, 'rb')
            # Base64 encode image and create dataURL
            data = self.b64(data)
            data = '__imageResource("data:%s;base64,%s")' % (mimetype, data)
        else: # is_binary
            data = open(filename, 'rb')
            data = self.b64(data)
            data = '"%s"' % data

        return data
            
    def b64(self, data):
        """
        Base 64 encode binary data
        """
        output = StringIO()
        data = base64.encode(data, output)

        # Remote whitespace from string
        return re.sub('\s+', '', output.getvalue())

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
    parser = OptionParser(usage="Usage: cocos make [options]")
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
    
