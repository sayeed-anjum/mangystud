<html>
    <head>
        <title>Welcome to mangystud!</title>
        <meta name="layout" content="main" />
	</head>
   <body>
   	 <br/>
   	 <ul><% contexts.each { out << "<li>" << it.name << "</li>" } %> </ul>
   </body>
</html>
