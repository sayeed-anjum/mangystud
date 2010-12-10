<html>
   <body>
   	 <ul><% realms.each { out << "<li>" << it.name << "</li>" } %> </ul>
   	 <br/>
   	 <ul><% contexts.each { out << "<li>" << it.name << "</li>" } %> </ul>
   </body>
</html>
