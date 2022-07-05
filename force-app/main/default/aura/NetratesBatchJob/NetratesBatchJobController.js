({
    doInit : function(component, event, helper){
        helper.loadCarriers(component, event, helper);
    },
    
	batchJobGeneration : function(component, event, helper) {
        helper.updateNetRateRecords(component, event, helper);
	},
    carrierSelectionOnChange : function(component, event, helper){       
        helper.loadServiceTypes(component, event, helper);
    },
    serviceTypeSelectionOnChange : function(component, event, helper){
            helper.fetchUniqueDates(component, event, helper);
    },
})