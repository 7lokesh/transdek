({
	selectRecord : function(component, event, helper) {
			// get the selected record from list  
      	var getSelectRecord = component.get("v.oRecord");
      	var compEvent = component.getEvent("oSelectedRecordEvent");
         compEvent.setParams({"recordByEvent" : getSelectRecord });  
         compEvent.fire();
    }
})