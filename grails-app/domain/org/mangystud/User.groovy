
package org.mangystud

class User extends grails.plugins.nimble.core.UserBase {
	static constraints = {
		name(maxSize:100, nullable:true)
		email(email:true, nullable:true)
	}
	
	String name;
	String email;

}
