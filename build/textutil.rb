def prepareMarkdown(data)
  contents=""
  headings=[]
  slugs=[]
  data=data.gsub(/<a\s+(id|name)[^>]*>\s*<\/a>/,"")
  data=data.gsub(/\t/," "*8)
  notetexts={}
  textstorefs={} # to help remove duplicate note texts
  data.scan(/<sup\s+id\s*\=\s*([^>]+)>\s*\(\d+\)\s*<\/sup>\s*([\s\S]+?)(?=<sup\s+id|\#\#|\z)/){|n|
    notetext=n[1].gsub(/\s+\z/,"")
    notetext=notetext.gsub(/<\/?small>/,"").gsub(/<br\/>\s*\z/,"").gsub(/\s+-\s*\z/,"").gsub(/\s+\z/,"")
    notetext=notetext.gsub(/\n\s*(-\s+|\d+\.)/) { "\n" + " "*4 + $1 }
    textstorefs[notetext]=n[0] if !textstorefs[notetext]
    notetexts[n[0]]=notetext
  }
  data.scan(/^\[\^(\d+)\]\:\s+([\s\S]+?)(?=\[\^\d+\]\:|\#\#|\z)/){|n|
    notetext=n[1].gsub(/\s+\z/,"")
    notetext=notetext.gsub(/<\/?small>/,"").gsub(/<br\/>\s*\z/,"").gsub(/\s+-\s*\z/,"").gsub(/\s+\z/,"")
    notetext=notetext.gsub(/\n\s*(-\s+|\d+\.)/) { "\n" + " "*4 + $1 }
    textstorefs[notetext]="Note"+n[0] if !textstorefs[notetext]
    notetexts["Note"+n[0]]=notetext
  }
  noterefs={} # Associates old note refs with new refs
  newnotetexts=[]
  data=data.gsub(/\)<\/sup>\:/,")</sup>\:")
  data=data.gsub(/([\s\S])\[\^(\d+)\](?!\s*\:)/){
     next $& if $1=="\n"
     next "#{$1}<sup>[#{$2}](\#Note#{$2})</sup>"
  }
  data=data.gsub(/<sup>\s*\[(?:\*\*)?\(\d+\)(?:\*\*)?\]\s*\(\#([^>]+)\)\s*<\/sup>/){
     noteref=$1
     newrefid=""
     newref=0
     ntext=notetexts[noteref] || "No note text yet."
     # Use canonical note reference for note text,
     # to avoid duplicate note texts
     noteref=textstorefs[ntext] || noteref
     if !noterefs[noteref]
       newref=newnotetexts.length
       newrefid="Note#{newref+1}"
       noterefs[noteref]=newref
       ntext=notetexts[noteref] || "No note text yet."
       #ntext="<sup id=#{newrefid}>(#{newref+1})</sup> "+ntext
       #newnotetexts.push("- <small>"+ntext+"</small>")
       newnotetexts.push("[^#{newref+1}]: "+ntext+"")
     else
       newref=noterefs[noteref]
       newrefid="Note#{newref+1}"
     end
     #next "<sup>[(#{newref+1})](##{newrefid})</sup>"
     next "[^#{newref+1}]"
  }
  data=data.gsub( /([^\\])\)\s*\[\^(\d+)\]/ ) { $1+"\\)[^"+$2+"]" } #/
  data=data.gsub( /<<([^\|\n>]*)\|([^\|]+?)>>/ ){
     noteref=$1||""
     notedata=$2
     next $& if noteref[/^\s+/] # sanity check
     newref=newnotetexts.length
     newrefid="Note#{newref+1}"
     noterefs[noteref]=newref
     ntext=notedata
     #ntext="<sup id=#{newrefid}>(#{newref+1})</sup> "+ntext
     #newnotetexts.push("- <small>"+ntext+"</small>")
     newnotetexts.push("[^#{newref+1}]: "+ntext+"")
     noterefparen=(noteref.length==0) ? "" : "\(#{noteref}\)"
     #noteref=noterefparen+"<sup>[(#{newref+1})](##{newrefid})</sup>"
     noteref=noterefparen+"[^#{newrefid}]"
     next noteref
  }
  #data=data.gsub(/(<small>)?(-\s+)?<sup\s+id[\s\S]+?(?=\#\#|\z)/){
  #  next newnotetexts.join("\n")+"\n\n"
  #}
  data=data.gsub(/^(\#\#+)[ \t]+Notes[ \t]*\n+[\s\S]*?(?=\#\#|\z)/){
   p1=$1
   p2=$2
   ret="#{p1} Notes\n\n"+newnotetexts.join("\n\n")+"\n\n"
  }
  data.scan(/^(\#\#+)\s+(.*)\s+?/){|heading|
   h0=heading[0]
   h1=heading[1]
   h1=h1.gsub(/<a\s+(id|name)[^>]*>\s*<\/a>/,"").gsub(/\s+$/,"")
   headings.push(h1)
   indent=" "*(4*(h0.length-2))+"- "
   h1slug=h1.gsub(/<[^>]*>/,"").gsub(/\W+/,"_").gsub(/^_+|_+$/,"")
   origslug=h1slug
   sindex=2
   while slugs.include?(h1slug)
     h1slug=origslug+"_#{sindex}"
     sindex+=1
   end
   slugs.push(h1slug)
   h1c=h1.gsub(/([\[\]])/) { "\\#{$1}" }
   contents+=indent+"["+h1c+"](##{h1slug})\n"
  }
  data=data.gsub(/^(\#\#+)\s+(Contents\b.*)\n+([\s\S]+?)(?=\#\#|\z)/){
   ret="#{$1} #{$2}\n\n"+contents+"\n\n"
   next ret
  }
  data=data.gsub(/^(\#\#+)[ \t]+(Notes\b.*)\n+([\s\S]*?)(?=\#\#|\z)/){
   p1=$1
   p2=$2
   nt=$3
   nt=nt.gsub(/\A\s+|\s+\z/,"")
   nt=nt.gsub(/<(p|div)\s+id\=notesection>/,"")
   nt=nt.gsub(/<\/(div|p|notesection)>/,"")
   nt=nt.gsub(/<notesection>/,"")
   nt=nt.gsub(/(-\s+)+/,"- ")
   nt=nt.gsub(/\A\s*<small>-/,"-")
   nt=nt.gsub(/(<small>\s*)+/,"<small>")
   ret="#{p1} #{p2}\n\n"+nt+"\n\n"
   next ret
  }
  data=data.gsub(/(\A|[^\\])\[(?!\*\*)([^\]\n]+)\]\(/){
   ret="#{$1}[**#{$2}**]("
   next ret
  }
  data=data.gsub(/\*\*\*\*+\]\(/,"**](")
  index=0
  data=data.gsub(/^(\#\#+)\s+(.*)\r?/){
   ret="<a id=#{slugs[index]}></a>\n#{$1} #{headings[index]}"
   index+=1
   next ret
  }
  if data.include?("<<Index:") && data.include?("## Index")
    headingre= /(<a\s+(?:id|name)\s*=\s*([^>]+)>\s*<\/a>\s*\#\#+\s+(.*)\s+?)/
    headingres= /(?:<a\s+(?:id|name)\s*=\s*(?:[^>]+)>\s*<\/a>\s*\#\#+\s+(?:.*)\s+?)/
    sections=data.split(headingres)
    iheadings=[];data.scan(headingre){|m|
      iheadings.push(m)
    }
    links=[]
    for i in 1...sections.length
      iheading=iheadings[i-1]
      sections[i]=sections[i].gsub(/<<\s*Index\:\s*([^>]+)>>/){
        items=$1
        items=items.split(/\s*\|\s*/)
        for item in items
          links.push("- **#{item}**: See [**#{iheading[2]}**](##{iheading[1]}).")
        end
        next ""
      }
    end
    links.sort!
    for i in 1...sections.length
      iheading=iheadings[i-1]
      if iheading[2]=="Index"
         sections[i]=links.join("\n")+"\n"+sections[i]
      end
    end
    newdata=[sections[0]]
    for i in 1...sections.length
      iheading=iheadings[i-1]
      newdata.push(iheading[0])
      newdata.push(sections[i])
    end
    data=newdata.join("")
  end
  return data
end

def preparePandoc(markdown)
  markdown=markdown.gsub(/^(?:\#)\s+(.*)\n+/) { "<h1>" + $1+"</h1>\n\n" }
  markdown=markdown.gsub(/^(?:\#\#)\s+(.*)\n+/) { "<small>\n# " + $1+"</small>\n\n" }
  markdown=markdown.gsub(/^(?:\#\#\#)\s+(.*)\n+/) { "## " + $1+"\n\n" }
  markdown=markdown.gsub(/^(?:\#\#\#\#)\s+(.*)\n+/) { "### " + $1+"\n\n" }
  markdown=markdown.gsub(/\[([^\]]+)\]\(\#[^\)]+\)/) { $1 }
  markdown=markdown.gsub(/(dash;|\:)(\n+)-\s+/) { $1+"\n\n- " }
  return markdown
end

def markdownTitle(markdown)
  title="Untitled"
  markdown.scan(/^(?:\#)\s+(.*)\n+/) {|m|
     title=m[0];break }
  if title=="Untitled"
   markdown.scan(/^(?:\#\#)\s+(.*)\n+/) {|m|
     title=m[0];break }
  end
  title=title.gsub(/&ndash;/,"--")
  return title
end

require 'tmpdir'
require 'fileutils'

def preparePdfs()
Dir.glob("*.md").sort.each{|fn|
  next if fn=="README.md"
  next if fn=="index.md"
  file=File.basename(fn).gsub(/\.md$/,"")
  r=IO.read("#{file}.md")
  mtime=File.mtime("#{file}.md")
  title=markdownTitle(r)
  r=r.gsub(/\A\s*(?:<a\s+id.*)?\s*(\#+\s+.*)\n+/) {
    $1+"\n\n" + sprintf("This version of the document is dated %04d-%02d-%02d.",
        mtime.year,mtime.mon,mtime.day) + "\n\n" }
  r=preparePandoc(r)
  #r=r.gsub(/_&lambda;_/,"$lambda$")
  #r="---\ntitle: #{title}\nauthor: Peter Occil\n---\n\n"+r
  tmpfilemd=Dir::tmpdir()+"/#{file}.md"
  IO.write(tmpfilemd,r)
  puts(r[0,100])
  i=0
  while true
    if i>10; break;end
    ii=i==0 ? "" : i.to_s
    rpdf=File.expand_path(".")+"/#{file}#{ii}.pdf"
    rtex=File.expand_path(".")+"/#{file}#{ii}.tex"
    rtmppdf=Dir::tmpdir()+"/#{file}#{ii}.pdf"
    p rtmppdf
    p rpdf
    outputengine="html5"
    #outputengine="latex"
    output="-o '#{rtmppdf}'"
    #output="-o '#{rtex}'"
    File.delete(rtex) rescue nil
    cmd="pandoc -V papersize=letter -f gfm --number-sections --number-offset=0 --top-level-division=" + (outputengine=="html5" ? "chapter" : "section")
    cmd+=" -t #{outputengine}"
    #cmd+=" --pdf-engine=lualatex"
    cmd+=" #{output} --metadata pagetitle=\"#{title}\""
    if outputengine!="html5"
      cmd+=" --variable=title:\"#{title}\""
      cmd+=" --variable=author:\"Peter Occil\""
    end
    cmd+=" -s #{tmpfilemd}"
    puts cmd
    puts `#{cmd}`
    p FileTest.exist?(rtmppdf)
    if !FileTest.exist?(rtmppdf) && !FileTest.exist?(rtex)
      i+=1; next
    end
    tm=Dir::tmpdir()+"/tempmeta.meta"
    IO.write(tm,
       "author Peter Occil\ntitle #{title}\n")
    `setpdfmetadata '#{rtmppdf}' '#{tm}' '#{rtmppdf}'`
    FileUtils.cp(rtmppdf,rpdf) rescue nil
    p rpdf
    p FileTest.exist?(rpdf)
    if FileTest.exist?(rpdf) || FileTest.exist?(rtex)
      File.delete("/tmp/#{file}.md") rescue nil
      File.delete("/tmp/tempmeta.meta") rescue nil
      File.delete("/tmp/#{file}#{ii}.pdf") rescue nil
      break
    end
    i+=1
  end
  #sleep(8)
}
end

if ARGV.include?("--pdf")
   preparePdfs()
end
