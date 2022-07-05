({
	fetchAccountRecord : function(component,event,helper) {
		var contractRec = component.get("v.ContractNewRec");
        var action1 = component.get("c.fetchContractAccountlookup");
        action1.setParams({'contractRecord':contractRec});
        action1.setCallback(this,function(response){
            var state = response.getState();
            if(state === 'SUCCESS'){
                var resultValue = response.getReturnValue();
                alert(resultValue);
                component.set('v.selectedLookUpRecord',JSON.stringify(resultValue));
                console.log(JSON.stringify(resultValue));
            }
        });
        $A.enqueueAction(action1);
	}
})