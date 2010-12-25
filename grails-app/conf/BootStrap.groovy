
import grails.converters.JSON 
import org.codehaus.groovy.grails.web.converters.marshaller.json.GroovyBeanMarshaller 
import org.mangystud.Tickler;

class BootStrap {
    def init = { servletContext ->
		def m = new GroovyBeanMarshaller()
        JSON.registerObjectMarshaller(Tickler, { instance, converter -> m.marshalObject(instance, converter) });    }

	def destroy = {
    }
}
