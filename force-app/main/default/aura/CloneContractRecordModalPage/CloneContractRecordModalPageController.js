({
	showContractsRecords : function(component, event, helper) {
		var action = component.get("c.fetchContractRecord");
        action.setParams({'recordId':component.get('v.recordId')});
        action.setCallback(this,function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                var resultValue = response.getReturnValue();                
                console.log('responsevalue',resultValue);
                component.set('v.contractObj',resultValue);
                component.set("v.ContractNewRec",resultValue);
                component.set('v.accountId',resultValue.Customer__c);
                console.log('tesult'+resultValue.Customer__c);
            }
        });
        $A.enqueueAction(action);
	},
        saveClick : function(component, event, helper){
        var contactRecord = component.get('v.contractObj');
        var sendRecordId = component.get('v.newAccountLookup').Id;
        var action = component.get("c.createContactRecord");
        action.setParams({'contract':contactRecord,'sendAccId':sendRecordId});
        action.setCallback(this,function(response){
            var state = response.getState();
            console.log('state'+state);
            if(state === 'SUCCESS')
            {
                var resultValue = response.getReturnValue();
                component.set('v.netRateMasterTable',JSON.parse(resultValue));
                var toastEvent = $A.get("e.force:showToast");
    			toastEvent.setParams({
                "type": 'success',
       	 		"title": "Success!",
        		"message": "Contract record has been cloned successfully."
    			});
    			toastEvent.fire();
                var dismissActionPanel = $A.get("e.force:closeQuickAction");
        		dismissActionPanel.fire();
            }
        });
                $A.enqueueAction(action);
                      
    },
    setLookupRecord : function(component, event, helper){
        var selectedAccGetFromEvent = event.getParam("selectedRecord");
        component.set('v.newAccountLookup',selectedAccGetFromEvent);
    }
})