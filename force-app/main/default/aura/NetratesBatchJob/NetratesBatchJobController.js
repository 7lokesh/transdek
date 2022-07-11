({
    doInit : function(component, event, helper){
        helper.loadCarriers(component, event, helper);
    },
    
	batchJobGeneration : function(component, event, helper) {
        
        //helper.loadZones2(component, event, helper);
       // helper.loadZones(component, event, helper);
        //alert('hi1');
        //alert('83939');
       // console.log('###mounikaCon'+JSON.stringify(component.get('v.discountRecords')));
          console.log('contro  discountRecords'+JSON.stringify(component.get('v.discountRecords')));
            console.log('contro weightDiscountRecords'+component.get('v.weightDiscountRecords'));
            console.log('contro minReductionRecords'+component.get('v.minReductionRecords'));
            console.log('contro otherServiceTypeDualListOptions'+JSON.stringify(component.get('v.otherServiceTypeDualListOptions')));
      //  helper.updateNetRateRecords(component, event, helper);
        //alert('hi2');
       helper.loadZonesTest(component, event, helper);
   },
    carrierSelectionOnChange : function(component, event, helper){       
        helper.loadServiceTypes(component, event, helper);
    },
    serviceTypeSelectionOnChange : function(component, event, helper){
            helper.fetchUniqueDates(component, event, helper);
    },
})