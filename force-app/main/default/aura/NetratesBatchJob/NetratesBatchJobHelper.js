({
    loadServiceTypes : function(component, event, helper) {
        
        var action = component.get("c.getServiceTypes");
        var next = this;
        action.setParams({'carrier' : component.get('v.selectedCarrier')});
        
        action.setCallback(this, function(a){
            component.set("v.serviceTypeList", a.getReturnValue());
            console.log(component.get("v.serviceTypeList"));
            next.loadServicePackaging(component);
        });
        
        component.set("v.showSpinner", false);
        $A.enqueueAction(action);
        
    },
    loadZonesTest : function(component, event, helper){
        var slectedDate,unqDate;
        var action = component.get("c.getServiceZones");
        //action.setParams({ firstName : cmp.get("v.firstName") });
        if(component.find("selectedDateValue").get("v.value").length ==0){        
            slectedDate=component.get("v.firstdate");
            console.log('slectedDate of if'+slectedDate);
            const [month, day, year] = slectedDate.split('-');
            unqDate = year+'-'+month+'-'+day;         
            console.log('formatteDate of if'+unqDate);
        }
        else{          
            slectedDate=component.find("selectedDateValue").get("v.value");
            console.log('slectedDate'+slectedDate);
            const [month, day, year] = slectedDate.split('-');
            unqDate = year+'-'+month+'-'+day;     
            console.log('slectedDate'+unqDate);
        }
        action.setParams({'carrier' : component.get('v.selectedCarrier'), 
                          'effDate' : unqDate, 
                          'serviceType' : component.get('v.shipmentMethodSelected').Associated_Service_for_Rates__c, 
                          'packaging' : component.get('v.selectedPackaging')});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                
                alert("From server: " + response.getReturnValue());
                component.set("v.serviceZoneList",response.getReturnValue());
                alert('inside success'+component.get("v.serviceZoneList"));
            }
            else if (state === "INCOMPLETE") {
                // do something
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
        });
        
        $A.enqueueAction(action);
        alert(component.get("v.serviceZoneList")+"AFTER EN");
    },
    loadCarriers : function(component, event, helper){
        var action = component.get("c.getCarriers");
        action.setCallback(this, function(a){
            component.set("v.carrierList", a.getReturnValue());
            console.log(component.get("v.carrierList"));
        });        
        $A.enqueueAction(action);
    },
    fetchUniqueDates : function(component,event,helper){
        //alert('unique');
        var serviceTypeList = component.get("v.serviceTypeList"); 
        console.log('serviceTypeList'+serviceTypeList);
        var selectedServiceId = component.get('v.selectedServiceType');
        console.log('selectedServiceId'+selectedServiceId);
        for(var i=0;i<serviceTypeList.length;i++){
            if(serviceTypeList[i].Id == selectedServiceId){
                var selServiceTypeRecord = serviceTypeList[i];
                component.set('v.shipmentMethodSelected',selServiceTypeRecord);
            }
            console.log('selected shipment'+JSON.stringify(component.get('v.shipmentMethodSelected')));
        }
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
        var slectedDate,unqDate;
        if(component.find("selectedDateValue").get("v.value").length ==0){        
            slectedDate=component.get("v.firstdate");
            console.log('slectedDate of if'+slectedDate);
            const [month, day, year] = slectedDate.split('-');
            unqDate = year+'-'+month+'-'+day;         
            console.log('formatteDate of if'+unqDate);
        }
        else{          
            slectedDate=component.find("selectedDateValue").get("v.value");
            console.log('slectedDate'+slectedDate);
            const [month, day, year] = slectedDate.split('-');
            unqDate = year+'-'+month+'-'+day;     
            console.log('slectedDate'+unqDate);
        }
        
        var impExpSel = component.get('v.importExportSelection');
        console.log('carrier'+carrier);
        console.log('serviceType'+serviceType);
        console.log('selectedPackaging'+selectedPackaging);
        console.log('unqDate'+unqDate);
        console.log('impExpSel'+impExpSel);
        
        var discountRecords = component.get('v.discountRecords');
        var wghDiscountRecords =  component.get('v.weightDiscountRecords');
        var otherServiceListOptions = component.get('v.otherServiceTypeDualListOptions');
        var zoneDualListoptions = component.get('v.zoneDualListOption');
        console.log('discountRecords of up'+JSON.stringify(discountRecords));
        console.log('wghDiscountRecords of up'+JSON.stringify(wghDiscountRecords));
        console.log('otherServiceListOptions of up'+JSON.stringify(otherServiceListOptions));
        console.log('zoneDualListoptions of up'+JSON.stringify(zoneDualListoptions));
        
        var action = component.get("c.updateNetRateOnPublishedRates");
        action.setParams({'carrier' :carrier,'servicetype':serviceType,'selectedPackaging':selectedPackaging,'effDate':unqDate,'importExportSel':impExpSel});
        action.setCallback(this, function(response){
            console.log('value'+response.getReturnValue());
        });
        $A.enqueueAction(action);
    },
    loadZones2 : function(component, event, helper) {
        var mounika = [949];
        component.set("v.discountRecords", mounika);
        console.log('***mounika'+mounika);
    },
    loadZones : function(component, event, helper) {
        //  var selectedNetRatesFromEvent = event.getParam("ListOfNetRateRecords");
        
        // component.set('v.netRateMasterTable',selectedNetRatesFromEvent);
        
        component.set("v.showSpinner",true);
        
        
        var slectedDate,unqDate;       
        if(component.find("selectedDateValue").get("v.value").length ==0){        
            slectedDate=component.get("v.firstdate");
            console.log('slectedDate of if'+slectedDate);
            const [month, day, year] = slectedDate.split('-');
            unqDate = year+'-'+month+'-'+day;         
            console.log('formatteDate of if'+unqDate);
        }
        else{          
            slectedDate=component.find("selectedDateValue").get("v.value");
            console.log('slectedDate'+slectedDate);
            const [month, day, year] = slectedDate.split('-');
            unqDate = year+'-'+month+'-'+day;     
            console.log('slectedDate'+unqDate);
        }
        //var sleDate = component.get("v.selectedDate");
        console.log('slectedDate',slectedDate);
        
        
        var action = component.get("c.getServiceZones");
        
        console.log('getting zone info');        
        action.setParams({'carrier' : component.get('v.selectedCarrier'), 'effDate' : unqDate, 'serviceType' : component.get('v.shipmentMethodSelected').Associated_Service_for_Rates__c, 'packaging' : component.get('v.selectedPackaging')});
        
        
        action.setCallback(this, function(a){
            component.set("v.serviceZoneList", a.getReturnValue());
            component.set("v.serviceZoneStrings", a.getReturnValue());
            console.log('servicezones'+JSON.stringify(a.getReturnValue()));
            
            var zones = component.get("v.serviceZoneList");
            console.log('service zones strings'+component.get('v.serviceZoneStrings'));
            //alert('zones'+JSON.stringify(zones));
            
            var weightDiscounts = [];
            var discounts = [];
            var minReductions = [];  
            var zoneListOptions = [];
            //sort zone list so it's in asc order
            zones.sort(function(a, b){return a-b});
            
            for(var i=0; i<zones.length; i++){
                var zoneVal = zones[i];
                console.log('zoneVal'+zoneVal);
                const zoneValOption = {
                    label: zoneVal,
                    value: zoneVal
                };
                zoneListOptions.push(zoneValOption);
                
                const d = {
                    zone: zoneVal,
                    earnedDiscount: null,
                    autoBonusDiscount: null,
                    discount: null,
                    minReduction: null,
                    publishedMin: null,
                    id: zoneVal
                };
                
                discounts.push(d);
                
            }
            console.log('discounts'+JSON.stringify(discounts));
            console.log('zoneListOptions'+JSON.stringify(zoneListOptions));
            //load service types not currently selected for dual list usage
            var serviceTypeList = component.get("v.serviceTypeList");
            console.log('serviceTypeList',JSON.stringify(serviceTypeList));
            var selectedService = component.get("v.selectedServiceType");
            //console.log('selectedService',selectedService);
            var dualListOptions = [];
            for(var i =0; i<serviceTypeList.length; i++){
                var name = serviceTypeList[i].Name;
                var id = serviceTypeList[i].Id;
                
                if(id != selectedService){
                    const serv = {
                        label: name,
                        value: id
                    };
                    dualListOptions.push(serv);
                }
            }
            
            component.set("v.discountRecords", discounts);
            
            console.log('>>>>>>discounts  ', typeof(discounts));
            component.set("v.weightDiscountRecords", weightDiscounts);
            //component.set("v.minReductionRecords", minReductions);
            component.set("v.otherServiceTypeDualListOptions", dualListOptions);
            component.set("v.zoneDualListOption", zoneListOptions);
            
            console.log('discountRecords'+JSON.stringify(component.get('v.discountRecords')));
            console.log('weightDiscountRecords'+component.get('v.weightDiscountRecords'));
            console.log('minReductionRecords'+component.get('v.zoneDualListOption'));
            console.log('otherServiceTypeDualListOptions'+JSON.stringify(component.get('v.otherServiceTypeDualListOptions')));
            console.log('>>>>>>1  ', component.get("v.discountRecords"));
        });
        
        window.setTimeout(
            $A.getCallback(function() {
                component.set("v.showSpinner",false);
            }), 1000
        );
        
        $A.enqueueAction(action);
        console.log('>>>>>>2  ', component.get("v.discountRecords"));
        console.log('service zones strings after enque'+component.get('v.serviceZoneStrings'));
        alert('service zones',component.get('v.serviceZoneList'));
    }
})