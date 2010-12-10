<div id="header">
     <div id="appname">{mangystud}</div>
   	 <div id="realm"><span>REALM </span>
   	 <% realms.each { out << "<span class='realm" << (it.active? " realm-activex" : "") << "'>" << it.name << "</span>"}%> 
	 </div>
</div>
