#!/usr/bin/ruby
Dir.chdir(File.dirname(__FILE__))
`lessc style.less > ../style.css`
plugins=%w( postcss-import postcss-cssnext postcss-colormin postcss-minify-font-values
   postcss-merge-longhand postcss-minify-selectors
   postcss-unique-selectors postcss-zindex
   postcss-merge-rules postcss-merge-idents
   postcss-reduce-idents postcss-discard-duplicates
   postcss-discard-empty postcss-discard-comments
   postcss-discard-unused cssnano )

plugins.each{|f|
 if !FileTest.directory?("/usr/local/lib/node_modules/#{f}")
  puts f
  `npm install -g #{f}`
 end
}
cmd="postcss"
plugins.each{|f|
 cmd+=" --use #{f}"
}
cmd+=" --postcss-discard-comments.removeAll true -o ../style.css < ../style.css"
`#{cmd}`