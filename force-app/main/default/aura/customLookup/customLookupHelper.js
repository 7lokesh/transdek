({
	searchHelper : function(component,event,getInputkeyWord) {
     var action = component.get("c.fetchLookUpValues");
        action.setParams({
            'searchKeyWord': getInputkeyWord,
            'ObjectName' : component.get("v.objectAPIName"),
            'recordId' : component.get('v.valueAttr')
          });
        action.setCallback(this, function(response) {
          $A.util.removeClass(component.find("mySpinner"), "slds-show");
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                //alert('storeResponse'+storeResponse);
              // if storeResponse size is equal 0 ,display No Result Found... message on screen.                }
                if (storeResponse.length == 0) {
                    component.set("v.Message", 'No Result Found...');
                } else {
                    component.set("v.Message", '');
                }
                // set searchResult list with return value from server.
                //console.log('storeResponse'+JSON.stringify(storeResponse));
                component.set("v.listOfSearchRecords",storeResponse);
                console.log(component.get("v.listOfSearchRecords"));
            }
 
        });
        $A.enqueueAction(action);
    
	},
})