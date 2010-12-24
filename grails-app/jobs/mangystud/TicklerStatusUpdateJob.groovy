package mangystud


class TicklerStatusUpdateJob {
	def ticklerService
	 
	static triggers = {
       cron name: 'cronTrigger', cronExpression: "0 0/5 * * * ?"
   }

    def execute() {
        ticklerService.updateTicklerStatus();
    }
}
