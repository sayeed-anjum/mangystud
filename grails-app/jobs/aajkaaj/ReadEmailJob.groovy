package aajkaaj


class ReadEmailJob {
    def timeout = 12000l // execute job once in 5 seconds
	def inboxService

	def execute() {
		// println 'read email job ' + new Date()
		inboxService.readVerifyEmails()
		inboxService.readEmails()
    }
}
