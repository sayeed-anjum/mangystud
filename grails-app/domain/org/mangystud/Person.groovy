
package org.mangystud

class Person extends grails.plugins.nimble.core.UserBase {
	static searchable = {
        root false
		id name: 'userid'
    } 
	
	static constraints = {
		name(maxSize:100, nullable:true)
		email(email:true, nullable:true)
	}
	
	String name;
	String email;

}
