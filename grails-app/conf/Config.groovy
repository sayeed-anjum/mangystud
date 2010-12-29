// locations to search for config files that get merged into the main config
// config files can either be Java properties files or ConfigSlurper scripts

 grails.config.locations = []
 
 if(System.properties["${appName}.config.location"]) {
	 println "reading config from file: " + System.properties["${appName}.config.location"]
    grails.config.locations << "file:" + System.properties["${appName}.config.location"]
 }

grails.project.groupId = appName // change this to alter the default package name and Maven publishing destination
grails.mime.file.extensions = true // enables the parsing of file extensions from URLs into the request format
grails.mime.use.accept.header = false
grails.mime.types = [ html: ['text/html','application/xhtml+xml'],
                      xml: ['text/xml', 'application/xml'],
                      text: 'text/plain',
                      js: 'text/javascript',
                      rss: 'application/rss+xml',
                      atom: 'application/atom+xml',
                      css: 'text/css',
                      csv: 'text/csv',
                      all: '*/*',
                      json: ['application/json','text/json'],
                      form: 'application/x-www-form-urlencoded',
                      multipartForm: 'multipart/form-data'
                    ]

// URL Mapping Cache Max Size, defaults to 5000
//grails.urlmapping.cache.maxsize = 1000

// The default codec used to encode data with ${}
grails.views.default.codec = "none" // none, html, base64
grails.views.gsp.encoding = "UTF-8"
grails.converters.encoding = "UTF-8"
// enable Sitemesh preprocessing of GSP pages
grails.views.gsp.sitemesh.preprocess = true
// scaffolding templates configuration
grails.scaffolding.templates.domainSuffix = 'Instance'
grails.views.javascript.library="jquery"

// Set to false to use the new Grails 1.2 JSONBuilder in the render method
grails.json.legacy.builder = false
// enabled native2ascii conversion of i18n properties files
grails.enable.native2ascii = true
// whether to install the java.util.logging bridge for sl4j. Disable for AppEngine!
grails.logging.jul.usebridge = true
// packages to include in Spring bean scanning
grails.spring.bean.packages = []

def logDirectory = '.'

// set per-environment serverURL stem for creating absolute links
environments {
    production {
        grails.serverURL = "http://www.changeme.com"
    }
    development {
        grails.serverURL = "http://localhost:8080/${appName}"
		uiperformance.enabled = false
     }
    test {
        grails.serverURL = "http://localhost:8080/${appName}"
		uiperformance.enabled = false
		logDirectory = "../logs"
    }

}

// log4j configuration
log4j = {
	appenders {
		console name:'stdout'
		rollingFile  name:'file', file: logDirectory + '/aajkaaj.log', threshold: org.apache.log4j.Level.INFO, maxFileSize:"1MB", maxBackupIndex: 10, 'append':true
	}
	
    error  'org.codehaus.groovy.grails.web.servlet',  //  controllers
           'org.codehaus.groovy.grails.web.pages', //  GSP
           'org.codehaus.groovy.grails.web.sitemesh', //  layouts
           'org.codehaus.groovy.grails.web.mapping.filter', // URL mapping
           'org.codehaus.groovy.grails.web.mapping', // URL mapping
           'org.codehaus.groovy.grails.commons', // core / classloading
           'org.codehaus.groovy.grails.plugins', // plugins
           'org.codehaus.groovy.grails.orm.hibernate', // hibernate integration
           'org.hibernate',
           'org.springframework',
           'net.sf.ehcache.hibernate'

    warn   'org.mortbay.log'
	
	debug  'NimbleBootStrap',
		   'grails.app'

   root {
	   warn 'stdout', 'file'
	   additivity = true
   }
}

uiperformance.bundles = [
	[type: 'js',
	 name: 'app.all',
	 files: ['application','dashboard','dialogs', 'inbox']],
	[type: 'css',
	 name: 'bundled',
	 files: ['ui-lightness/jquery-ui-1.8.7.custom','main']]
 ]

uiperformance.exclusions = [
	"**/plugins/**",
	"**/dojo/**"
 ]

beans {
	inboxSettings {
		host = ''
		port = 143
		user = ''
		password = ''
	}

	verifyInboxSettings {
		host = ''
		port = 143
		user = ''
		password = ''
	}
}
