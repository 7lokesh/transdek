({
    loadCarriers : function(component, event, helper) {
        
        var action = component.get("c.getCarriers");
        action.setCallback(this, function(a){
            component.set("v.carrierList", a.getReturnValue());
            console.log(component.get("v.carrierList"));
        });
        
        //component.set("v.showSpinner", false);
        $A.enqueueAction(action);
        
    },
    
    loadServiceTypes : function(component, event, helper) {
        
        var action = component.get("c.getServiceTypes");
        var next = this;
        //component.set("v.selectedCarrier", "FedEx");
        action.setParams({'carrier' : component.get('v.selectedCarrier')});
        
        action.setCallback(this, function(a){
            component.set("v.serviceTypeList", a.getReturnValue());
            console.log('servicetype list'+JSON.stringify(component.get("v.serviceTypeList")));
            next.loadServicePackaging(component);
        });
        
        component.set("v.showSpinner", false);
        $A.enqueueAction(action);
        
    },
    
    loadServicePackaging : function(component, event, helper) {
        
        var action = component.get("c.getServicePackagingList");
        
        action.setCallback(this, function(a){
            component.set("v.servicePackagingList", a.getReturnValue());
            component.set("v.selectedPackaging", "Customer Packaging");
            //next.loadServicePackaging(component);
        });
        
        component.set("v.showSpinner", false);
        $A.enqueueAction(action);
        
    },
    
    loadZones : function(component, event, helper) {
        var selectedNetRatesFromEvent = event.getParam("ListOfNetRateRecords");
        
        component.set('v.netRateMasterTable',selectedNetRatesFromEvent);
        
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
            console.log('servicezones'+JSON.stringify(a.getReturnValue()));
            var zones = component.get("v.serviceZoneList");
            
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
            console.log('dualListOptions'+JSON.stringify(dualListOptions));
            console.log('discountsfinal'+discounts);
            component.set("v.discountRecords", discounts);
            component.set("v.weightDiscountRecords", weightDiscounts);
            //component.set("v.minReductionRecords", minReductions);
            component.set("v.otherServiceTypeDualListOptions", dualListOptions);
            component.set("v.zoneDualListOption", zoneListOptions);
            
            //console.log(component.get("v.weightDiscountRecords"));
            console.log('discountRecords'+JSON.stringify(component.get('v.discountRecords')));
            console.log('weightDiscountRecords'+component.get('v.weightDiscountRecords'));
            console.log('minReductionRecords'+component.get('v.minReductionRecords'));
            console.log('otherServiceTypeDualListOptions'+JSON.stringify(component.get('v.otherServiceTypeDualListOptions')));
            //console.log('zoneDualListOptionfinal'+component.get('zoneDualListOption'));
        });
        
        window.setTimeout(
            $A.getCallback(function() {
                component.set("v.showSpinner",false);
            }), 1000
        );
        $A.enqueueAction(action);
        
    },
    
    saveZoneDiscounts : function(component, event, helper) {        
        var action = component.get("c.getServiceTypes");
        component.set("v.showSpinner", false);
        $A.enqueueAction(action);
        
    },
    
    generateRateTables : function(component, event, helper) {
        component.set("v.showSpinner",true); 
        var otherServiceList = component.get("v.otherServicesListValue");
        var otherServiceOptions = component.get("v.otherServiceTypeDualListOptions");
        
        var discountData = component.get("v.discountRecords");
        
        var minReductionData = component.get("v.minReductionRecords");
        var currentWeightDiscounts = component.get("v.weightDiscountRecords");
        console.log('discountData of gen'+JSON.stringify(discountData));
                console.log('minReductionData gen'+JSON.stringify(minReductionData));
        console.log('currentWeightDiscounts gen'+JSON.stringify(currentWeightDiscounts));

        var selDateValue = component.get('v.firstdate');
        const [month, day , year] = selDateValue.split('-');
        var unqDate = year+'-'+month+'-'+day;     
        
        var action = component.get("c.buildRateTables_v2");
        action.setParams({'carrier' : component.get('v.selectedCarrier'), 'effDate' : unqDate, 'serviceType' : component.get('v.selectedServiceType'),'packaging' : component.get('v.selectedPackaging'), 'discounts' : JSON.stringify(discountData), 'minReductions' : JSON.stringify(minReductionData), 'weightDiscounts' : JSON.stringify(currentWeightDiscounts)});
        
        action.setCallback(this, function(a){
            component.set("v.netRateMasterMap", a.getReturnValue());
            console.log('net rate',a.getReturnValue());
            console.log('returnValue of map'+JSON.stringify(a.getReturnValue()));
            var netRateList = Object.values(component.get("v.netRateMasterMap"));
            netRateList.sort(function(a, b){return a-b});
            netRateList.sort((a, b) => (a.weight > b.weight) ? 1 : (a.weight === b.weight) ? ((parseInt(a.zone) > parseInt(b.zone)) ? 1 : -1) : -1 );
            component.set("v.netRateMasterTable", netRateList);
            component.set('v.upInsertnetRateMasterTable', netRateList);
            
            console.log('netRateMasterTable'+JSON.stringify(component.get('v.upInsertnetRateMasterTable')));
        });
        
        window.setTimeout(
            $A.getCallback(function() {
                component.set("v.showSpinner",false);
            }), 2000
        );  
        $A.enqueueAction(action);
        
    }, 
    
    saveNetRateData : function(component, event, helper) {           
        component.set("v.showSpinner",true);
        var selectedName,comboName,finalObject=[],tempObj;
        
        var objs=component.get("v.serviceTypeList");
        for(var x of objs){
            if(x.Id==component.find("serviceType").get("v.value")){
                comboName={
                    Id:x.Id,
                    Name:x.Name
                }
                finalObject.push(comboName);
            }
        }
        if(component.get('v.totalServiceTypeList') !=null){
            var totalServiceRecords = component.get('v.totalServiceTypeList');
            for(var k in totalServiceRecords){
                finalObject.push(totalServiceRecords[k]);
            }
        }       
        var otherserviceslist =  component.get("v.otherServicesListValue");
        
        var otherServiceOptions = component.get("v.otherServiceTypeDualListOptions");
        
        var action = component.get("c.saveRateData");
        
        var netRates = component.get("v.netRateMasterTable");
        console.log('netRates'+JSON.stringify(netRates));
        
        var totalRecords = component.get('v.upInsertnetRateMasterTable');
        console.log('totalRecords'+JSON.stringify(totalRecords));
        action.setParams({'netRateList' : JSON.stringify(totalRecords), 'contract' : component.get("v.contractRecord"), 'importExport' : component.get("v.importExportSelection"),'otherServices':JSON.stringify(finalObject)});   
        action.setCallback(this, function(a){
            var res = a.getReturnValue();
        });                
        $A.enqueueAction(action);     
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": "Success!",
            "message": "Net Rates successfully entered into the system for this Contract"
        });
        toastEvent.fire();
        window.setTimeout(
            $A.getCallback(function() {
                component.set("v.showSpinner",false);
            }), 1000
        );  
    },	
    
    draftvalues : function(component, event, helper) {
        var selectedService;
        if(component.get('v.success')==='success' && component.get('v.SuccessTrue')==false){
            //alert('inside');
            //var year = component.get("v.selectedYear");
            var selDate = component.get("v.firstdate");
            const [month, day, year] = selDate.split('-');
            var unqDate = year+'-'+month+'-'+day;
            //alert('selDate inside'+selDate);
            var carrier = component.get("v.selectedCarrier");
            selectedService = component.get('v.selectedServiceType'); 
            var selectedservicePackaging = component.get("v.selectedPackaging");
            var action1 = component.get("c.getServiceZones");
            action1.setParams({'carrier' :carrier , 'effDate' :unqDate, 'serviceType' :selectedService, 'packaging' :selectedservicePackaging});
            action1.setCallback(this,function(response){
                component.set("v.serviceZoneList", response.getReturnValue());
                console.log('result'+response.getReturnValue());
                var zones = component.get("v.serviceZoneList");
                console.log('zones'+JSON.stringify(zones));
                var weightDiscounts = [];
                var discounts = [];
                var minReductions = [];
                var zoneListOptions = [];
                zones.sort(function(a, b){return a-b});
                for(var i=0; i<zones.length; i++){
                    var zoneVal = zones[i];
                    console.log('zoneVal if'+zoneVal);
                    const zoneValOption = {
                        label: zoneVal,
                        value: zoneVal
                    };
                    zoneListOptions.push(zoneValOption);
                    console.log('zoneListOptions if'+JSON.stringify(zoneListOptions));
                    const d = {
                        zone: zoneVal,
                        earnedDiscount: null,
                        autoBonusDiscount: null,
                        discount: null,
                        minReduction: null,
                        publishedMin: null,
                        id: zoneVal
                        //publishedMinWeight : publishedMinWeight,
                        //publishedMinZone : publishedMinZone
                    };
                    
                    discounts.push(d);
                    console.log('discounts if'+JSON.stringify(discounts));
                }
                //load service types not currently selected for dual list usage
                var serviceTypeList = component.get("v.serviceTypeList");
                console.log('serviceTypeList if',JSON.stringify(serviceTypeList));
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
                        console.log('dualListOptions if'+JSON.stringify(dualListOptions));
                    }
                }
                console.log('discountsfinal if'+discounts);
                component.set("v.discountRecords", discounts);
                component.set("v.weightDiscountRecords", weightDiscounts);
                //component.set("v.minReductionRecords", minReductions);
                component.set("v.otherServiceTypeDualListOptions", dualListOptions);
                component.set("v.zoneDualListOption", zoneListOptions);
            });    
            $A.enqueueAction(action1);
            //helper.loadZones(component, event, helper);                       
        }
        if(component.get('v.SuccessTrue') == true){
            var action = component.get("c.getDraftdata");//get data from controller
            //alert('intial')
            action.setParams({'carrier':component.get("v.selectedCarrier"),'servicePackaging':component.get("v.selectedPackaging"),'selectedServiceType':component.get('v.selectedServiceType')});
            action.setCallback(this, function(a) {
                var jsonData=JSON.parse(JSON.stringify(a.getReturnValue()));
                console.log('jsonData'+JSON.stringify(a.getReturnValue()));
                var discountslist = [];                       
                for(let i = 0; i<jsonData.length; i++){                
                    discountslist.push({ 'zone': jsonData[i].Zone__c, 'earnedDiscount': jsonData[i].Earned_Discount__c, 'autoBonusDiscount': jsonData[i].Auto_bonus_discount__c, 'discount':jsonData[i].Discount__c,'minReduction':jsonData[i].Min_Reduction__c,'publishedMin':jsonData[i].Published_Min__c,'publishedMinWeight':jsonData[i].Published_Min_Weight__c,'publishedMinZone':jsonData[i].Published_Min_Zone__c});
                    console.log('eachdiscount'+JSON.stringify(discountslist));
                }   
                console.log('discountslist'+discountslist);
                if(jsonData.length>0){
                    console.log('before setting greater'+discountslist);
                    component.set("v.discountRecords",discountslist);  
                    console.log('after setting'+JSON.stringify(component.get('v.discountRecords')));
                }
                if(discountslist.length >0){
                    helper.generateRateTables(component, event, helper);
                }
                if(discountslist.length <=0){
                    var selDate = component.get("v.firstdate");
                    const [month, day, year] = selDate.split('-');
        			var unqDate = year+'-'+month+'-'+day;     
                    console.log('selDate inside draft'+selDate);
                    var carrier = component.get("v.selectedCarrier");
                    var serviceTypeValue = component.find("serviceType").get("v.value");
                    var selectedservicetype = component.get("v.selectedPackaging");
                    var action = component.get("c.fetchNetRateRecords");
                    action.setParams({'recordId':component.get("v.recordId"),'servicetype':serviceTypeValue,'selDate':unqDate,'carrier':carrier,'selectedService':selectedservicetype});
                    action.setCallback(this,function(a){
                        var netRateRecords =  a.getReturnValue();
                        component.set("v.netRateMasterTable",JSON.parse(netRateRecords));
                    });
                    $A.enqueueAction(action);
                }
            });
            $A.enqueueAction(action);
        }
    },
    
    deleteDraft : function(component, event, helper) {
        var action = component.get("c.deleteDraft");
        action.setCallback(this, function(response) {
            
        });
        $A.enqueueAction(action);
    },
    
    fetchUniqueDates : function(component,event,helper){
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
                /*var name = serviceTypeList[i].Name;//ground
                var id = serviceTypeList[i].Id;  // groundrecordId
            	var associated = serviceTypeList[i].Associated_Service_for_Rates__c;
            	const serv = {
                    label : name,
                    value : serviceTypeList[i].Associated_Service_for_Rates__c
            	}
                console.log('serv'+JSON.stringify(serv));*/
        }
        console.log('updated'+component.get('v.shipmentMethodSelected').Associated_Service_for_Rates__c);
        var action = component.get("c.fetchDistinctDates");
        action.setParams({'carrier':component.get('v.selectedCarrier'),'serviceType':component.get('v.shipmentMethodSelected').Associated_Service_for_Rates__c})
        action.setCallback(this,function(response){
            var state = response.getState();
            var uniqueDates =  response.getReturnValue();
            
            console.log('uniquedates'+uniqueDates);
            
            const [year, month, day] = uniqueDates[0].split('-');
            var dt = month+'-'+day+'-'+year;
            console.log('dt outside'+dt);
            
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
            var uniqDates = component.get('v.EffectiveDatesWithoutStrings');
        });
        $A.enqueueAction(action);
    }
})