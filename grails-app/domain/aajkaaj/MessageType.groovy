package aajkaaj


public enum MessageType {
	Mail('MAIL'),
	DelegatorRequest('DLRR');
	
	final String id;
	
	MessageType(String id) { this.id = id; }
}
