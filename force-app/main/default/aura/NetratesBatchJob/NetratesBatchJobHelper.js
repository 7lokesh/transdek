({
 loadServiceTypes : function(component, event, helper) {
        
        var action = component.get("c.getServiceTypes");
        var next = this;
        //component.set("v.selectedCarrier", "FedEx");
        action.setParams({'carrier' : component.get('v.selectedCarrier')});
        
        action.setCallback(this, function(a){
            component.set("v.serviceTypeList", a.getReturnValue());
            console.log(component.get("v.serviceTypeList"));
            next.loadServicePackaging(component);
        });
        
        component.set("v.showSpinner", false);
        $A.enqueueAction(action);
        
    },
    loadCarriers : function(component, event, helper){
                var action = component.get("c.getCarriers");
        action.setCallback(this, function(a){
            component.set("v.carrierList", a.getReturnValue());
            console.log(component.get("v.carrierList"));
        });
        
        //component.set("v.showSpinner", false);
        $A.enqueueAction(action);
    },
    fetchUniqueDates : function(component,event,helper){
        //alert('unique');
        //alert('fetch');
        var action = component.get("c.fetchDistinctDates");
        action.setParams({'carrier':component.get('v.selectedCarrier'),'serviceType':component.get('v.selectedServiceType')})
        action.setCallback(this,function(response){
            var state = response.getState();
            var uniqueDates =  response.getReturnValue();
            
            console.log('uniquedates'+uniqueDates);
            
            const [year, month, day] = uniqueDates[0].split('-');
            var dt = day+'-'+month+'-'+year;
            
            var newUniqDates = [];
            for(let i=0;i<uniqueDates.length;i++){
                var k = uniqueDates[i];
                const [year, month, day] = uniqueDates[i].split('-');
                var dt = month+'-'+day+'-'+year;;
                newUniqDates.push(dt);
            }
            
            component.set("v.firstdate",dt);                       
            component.set("v.EffectiveDates",uniqueDates);
            component.set('v.EffectiveDatesWithoutStrings',newUniqDates);
            
        });
        $A.enqueueAction(action);
    },
     loadServicePackaging : function(component, event, helper) {
        
        var action = component.get("c.getServicePackagingList");
        
        action.setCallback(this, function(a){
            component.set("v.servicePackagingList", a.getReturnValue());
            component.set("v.selectedPackaging", "Customer Packaging");
        });
        
        component.set("v.showSpinner", false);
        $A.enqueueAction(action);
        
    },
    updateNetRateRecords : function(component,event,helper){
        
        var carrier = component.get('v.selectedCarrier');
        var serviceType = component.get('v.selectedServiceType');
        var selectedPackaging = component.get("v.selectedPackaging");
        var selDate = component.get("v.firstdate");
        const [month, day, year] = selDate.split('-');
        var unqDate = year+'-'+month+'-'+day;   
        var impExpSel = component.get('v.importExportSelection');
   		console.log('carrier'+carrier);
        console.log('serviceType'+serviceType);
        console.log('selectedPackaging'+selectedPackaging);
        console.log('unqDate'+unqDate);
        console.log('impExpSel'+impExpSel);
        
        var action = component.get("c.updateNetRateOnPublishedRates");
        action.setParams({'carrier' :carrier,'servicetype':serviceType,'selectedPackaging':selectedPackaging,'effDate':unqDate,'importExportSel':impExpSel});
        action.setCallback(this, function(response){
           console.log('value');
        });
        $A.enqueueAction(action);
    }

})