package org.mangystud

import grails.converters.JSON 
import org.apache.shiro.SecurityUtils 

class TiddlerController {

    def add = {
		def type = params.type
		def title = params.title 
		def realm = Realm.findByActive(true)
		def user = User.get(SecurityUtils.getSubject()?.getPrincipal())
		
		if (user == null) {
			render {error: "No current user!"} as JSON
			return;
		}
		if (realm == null) {
			render {error: "No active realm found!"} as JSON
			return;
		}
		if (type == "Action") {
			Action action = new Action(title:title, realm:realm, owner:user)
			try {
				action.save(failOnError: true)
			} catch (Exception e) {
				render {error: "Error when saving."} as JSON
			} 
			def model = [action: action, realm: realm];
			render model as JSON
		}
	}
}
