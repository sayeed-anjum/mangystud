package aajkaaj


class ReadEmailJob {
	def inboxService

	static triggers = {
		cron name: 'readEmailTrigger', cronExpression: "0 0/2 * * * ?"
	}
 
	def execute() {
		inboxService.readVerifyEmails()
		inboxService.readEmails()
    }
}
