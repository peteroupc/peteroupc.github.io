#!/usr/bin/ruby
Dir.chdir(File.dirname(__FILE__))
# Install PostCSS
`lessc style.less > ../style.css`
plugins=%w( postcss-import postcss-cssnext postcss-colormin postcss-minify-font-values
   postcss-merge-longhand postcss-minify-selectors
   postcss-unique-selectors postcss-zindex
   postcss-merge-rules postcss-merge-idents
   postcss-reduce-idents postcss-discard-duplicates
   postcss-discard-empty postcss-discard-comments
   postcss-discard-unused cssnano )
if false

plugins.each{|f|
 if !FileTest.directory?("/usr/local/lib/node_modules/#{f}")
  puts f
  `npm install -g #{f}`
 end
}
end
cmd="postcss" # postcss-cli package
 cmd+=" --use #{f}"
}
cmd+=" --postcss-discard-comments.removeAll true -o ../style.css < ../style.css"
puts cmd
`#{cmd}`
