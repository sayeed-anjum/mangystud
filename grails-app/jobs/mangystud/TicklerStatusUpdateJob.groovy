package mangystud


class TicklerStatusUpdateJob {
	def ticklerService
	 
	static triggers = {
       cron name: 'cronTrigger', cronExpression: "0 0/15 * * * ?"
   }

    def execute() {
        ticklerService.updateTicklerStatus();
    }
}
