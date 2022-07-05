({
    
    doInit : function(component, event, helper) {
        
        //set up year drop down
        var date = new Date();
        var year = date.getFullYear();
        console.log("current year: " + year);
        var years = [];
        
        for(var i=year; i > year - 5; i--) {
            years.push(i);
        }
        
        console.log(years);
        
        component.set('v.years', years);
        //helper.fetchUniqueDates(component, event, helper);
        //set up discount headers
        component.set("v.discountTableHeaders", [
            {label: "Zone", fieldName: "zone", type: "string", editable: false},
            {label: "Earned Discount %", fieldName: "earnedDiscount", type: "string", editable: true, formatter: 'percent-fixed'},
            {label: "Automation Bonus Discount %", fieldName: "autoBonusDiscount", type: "string", editable: true},
            {label: "Discount %", fieldName: "discount", type: "string", editable: true},
            {label: "Min Reduction", fieldName: "minReduction", type: "currency", editable: true},
            {label: "Published Min Weight", fieldName: "publishedMinWeight", type: "string", editable: true},
            {label: "Published Min Zone", fieldName: "publishedMinZone", type: "string", editable: true},
            {label: "Published Min", fieldName: "publishedMin", type: "currency", editable: true}
       
        ]);
        
        //set up min reduction headers
       /* component.set("v.minReductionTableHeaders", [
            {label: "Zone", fieldName: "zone", type: "string", editable: false},
            {label: "Min Reduction", fieldName: "minReduction", type: "currency", editable: true},
            //{label: "Min Published Rate", fieldName: "minPublishedRate", type: "currency", editable: true},
            {label: "Published Min", fieldName: "publishedMin", type: "currency", editable: true}
        ]);*/
        
        //set up weight discount table headers
        component.set("v.weightDiscountTableHeaders", [
            {label: "Zone", fieldName: "zone", type: "string", editable: true},
            {label: "Weight Min", fieldName: "weightMin", type: "double", editable: true},
            {label: "Weight Max", fieldName: "weightMax", type: "double", editable: true},
            {label: "Discount %", fieldName: "discount", type: "string", editable: true}
        ]);
        
        //set up net rate table headers
        component.set("v.netRateTableHeaders", [
            {label: "Weight", fieldName: "weight", type: "double", editable: false},
            {label: "Zone", fieldName: "zone", type: "string", editable: false},
            {label: "Published Rate", fieldName: "publishedRate", type: "currency", editable: false},
            {label: "Net Rate", fieldName: "netRate", type: "currency", editable: false},
            //{label: "Earned Discount %", fieldName: "earnedDiscount", type: "string", editable: false},
            //{label: "Weight Discount %", fieldName: "weightDiscount", type: "string", editable: false},
            {label: "Contract Discount", fieldName: "totalExpectedDiscount", type: "percent", editable: false, typeAttributes: {step: '1', minimumFractionDigits: '2'}},
            {label: "Net Effective Discount", fieldName: "netEffectiveDiscount", type: "percent", editable: false, typeAttributes: {minimumFractionDigits: '2'}},
            //{label: "Automation Bonus Discount %", fieldName: "autoBonusDiscount", type: "string", editable: false},
            //{label: "Discount %", fieldName: "discount", type: "string", editable: false},
            {label: "Min Reduction", fieldName: "minReduction", type: "currency", editable: false},
            {label: "Min Charge", fieldName: "minChargeAmount", type: "currency", editable: false},
            {label: "Expected Net Rate", fieldName: "expectedNetRate", type: "currency", editable: false},
            {label: "Leakage", fieldName: "leakage", type: "currency", editable: false},
            {label: "Min Used?", fieldName: "minimumUsed", type: "boolean", editable: false},
            //{label: "Id", fieldName: "netRateRecordId", type: "String", editable: false}
            //{label: "Published Minimum", fieldName: "publishedMinimum", type: "currency", editable: false}
        ]);
            
            helper.loadCarriers(component, event, helper);
            //helper.sortData(component, component.get("v.sortedBy"), component.get("v.sortedDirection"));
            
            }, 
            
            carrierSelectionOnChange : function(component, event, helper){       
            helper.loadServiceTypes(component, event, helper);
            },
            
            serviceTypeSelectionOnChange : function(component, event, helper){   
            //helper.loadZones(component, event, helper);
            helper.fetchUniqueDates(component, event, helper);
            },
            
            showDiscountInputs : function(component, event, helper){
            
            component.set("v.showSpinner",true);
            console.log("generating data");
            
            helper.loadZones(component, event, helper);
            helper.draftvalues(component, event, helper);
            
            window.setTimeout(
            $A.getCallback(function() {
            component.set("v.showSpinner",false);
            }), 500
            );  
            }, 
            
            addTableRow : function(component, event, helper){
            console.log("adding new row");
            
            var currentData = component.get("v.weightDiscountRecords");
            
            currentData.push({
            zone: "",
            weightMin: null,
            weightMax: null,
            discount: null,
            id: currentData.length+1
            });
            
            component.set("v.weightDiscountRecords", currentData);
            }, 
            
            saveWeightDiscountChanges : function(component, event, helper){
            console.log("saving weight discount input");
            var tableValues = event.getParam('draftValues');
            component.set("v.weightDiscounts_updated", tableValues);
            console.log(component.get("v.weightDiscounts_updated"));
            //helper.saveZoneDiscounts(component, event, helper);
            },
            
            saveMinReductionChanges : function(component, event, helper){
            console.log("saving min reduction input");
            var tableValues = event.getParam('draftValues');
            component.set("v.minReductions_updated", tableValues);
            //helper.saveZoneDiscounts(component, event, helper);
            },
            
            saveDiscountChanges : function(component, event, helper){
            console.log("saving discount input");
            var tableValues = event.getParam('draftValues');
            component.set("v.discounts_updated", tableValues);
            
            //helper.saveZoneDiscounts(component, event, helper);
            },
            
            generateData : function(component, event, helper){
            console.log("generating rate data");
            var s = true;
            component.set("v.showSpinner", s);
            component.set("v.disableSave", false);
            //console.log(component.get("v.spinner"));
            helper.generateRateTables(component, event, helper);              
            },
            
            saveNetRates : function(component, event, helper){
            console.log("saving rate data");
            component.set("v.showSpinner", true);
            console.log(component.get("v.spinner"));
            
            helper.saveNetRateData(component, event, helper);
            helper.deleteDraft(component, event, helper);
            if(event.getSource().get("v.value")=="refresh"){
            window.location.reload(); 
            }
            //helper.fetchNetRateSaveRecords(component, event, helper);
            },
            
            applyDiscountsToServices : function(component, event, helper){
            var comboName, finalObject=[];
                      var objs=component.get("v.serviceTypeList");
        for(var x of objs){
            if(x.Id==component.find("serviceTypeDual").get("v.value")){
                comboName={
                    Id:x.Id,
                    Name:x.Name
                }
                finalObject.push(comboName);
            }
        }
        component.set('v.totalServiceTypeList',finalObject);
        helper.saveNetRateData(component, event, helper);     
    },
    populateAllRowsDiscount:function(component, event, helper){
        component.set("v.showSpinner",true);
      
        var jsonData = JSON.parse(JSON.stringify(component.get("v.discountRecords")));
        
        var earnedDiscount = jsonData[0].earnedDiscount;
        var autoBonusDiscount = jsonData[0].autoBonusDiscount;
        var discount = jsonData[0].discount;
        var minReduction=jsonData[0].minReduction;
        var publishedMinWeight=jsonData[0].publishedMinWeight;
        var publishedMinZone=jsonData[0].publishedMinZone;
        //var publishedMin=jsonData[0].publishedMin;
        
        var discounts = [];
        
        for(let i = 0; i < jsonData.length; i++){
            if(i==0){
               discounts.push({ 'zone': jsonData[i].zone, 'earnedDiscount': earnedDiscount, 'autoBonusDiscount': autoBonusDiscount, 'discount':discount,'minReduction':minReduction,'publishedMinWeight':publishedMinWeight,'publishedMinZone':publishedMinZone});
                console.log('discounts'+i+JSON.stringify(discounts));
            }
            else{
               discounts.push({ 'zone': jsonData[i].zone, 'earnedDiscount': earnedDiscount, 'autoBonusDiscount': autoBonusDiscount, 'discount':discount,'minReduction':minReduction,'publishedMinWeight':jsonData[i].publishedMinWeight,'publishedMinZone':jsonData[i].publishedMinZone});
            	console.log('discounts'+i+JSON.stringify(discounts));
            }
        }
        console.log(discounts);
        component.set("v.discountRecords" ,discounts);
        window.setTimeout(
            $A.getCallback(function() {
                component.set("v.showSpinner",false);
            }), 1000
        );    
        
        //helper.generateRateTables(component, event, helper);
    },
        calculateMinimums:function(component, event, helper){
        component.set("v.showSpinner",true);
        var jsonData = JSON.parse(JSON.stringify(component.get("v.discountRecords")));
        console.log('jsonData of obj'+JSON.parse(JSON.stringify(component.get("v.discountRecords"))));
        console.log('jsondata of string'+JSON.stringify(component.get("v.discountRecords")));
        var slectedDate,unqDate ;
        if(component.find("selectedDateValue").get("v.value").length ==0){
            slectedDate=component.get("v.firstdate");
            const [month, day, year] = slectedDate.split('-');
             unqDate = year+'-'+month+'-'+day;         
        }else{
            slectedDate=component.find("selectedDateValue").get("v.value");
            const [month, day, year] = slectedDate.split('-');
            unqDate = year+'-'+month+'-'+day;     
        }
        //var sleDate = component.get("v.selectedDate");
        console.log('slectedDate',unqDate);
        var action = component.get("c.fetchRateOnweightAndZone");//get data from controller

         var discountsList = [];
        
            for(let i = 0; i < jsonData.length; i++){
                discountsList.push({ 'zone': jsonData[i].zone, 'earnedDiscount': jsonData[i].earnedDiscount, 'autoBonusDiscount': jsonData[i].autoBonusDiscount, 'discount':jsonData[i].discount,'minReduction':jsonData[i].minReduction,'publishedMinWeight':jsonData[i].publishedMinWeight,'publishedMinZone':jsonData[i].publishedMinZone});
            }
            console.log('total records discounts'+discountsList);
        
        action.setParams({'carrier':component.get("v.selectedCarrier"),'serviceType' : component.get('v.selectedServiceType'),'servicePackaging':component.get("v.selectedPackaging"),"discounts":JSON.stringify(discountsList),'selDate' : unqDate});
            
            window.setTimeout(
                $A.getCallback(function() {
                    component.set("v.showSpinner",false);
                }), 1000
        );  
         action.setCallback(this, function(response){
            //component.set("v.calculateMinimums", a.getReturnValue());
            var jsonNewPrRecords = JSON.parse(response.getReturnValue())
            console.log("newPublishedRecords",JSON.parse(response.getReturnValue()));
             component.set('v.discountRecords',jsonNewPrRecords);
             console.log("Updated",component.get('v.discountRecords'));
         });
        $A.enqueueAction(action);  
    },
    
    populateAllRowsMinRecords:function(component, event, helper){
        component.set("v.showSpinner",true);
        var jsonData = JSON.parse(JSON.stringify(component.get("v.minReductionRecords")));
        var minReduction = jsonData[0].minReduction;
        var publishedMin = jsonData[0].publishedMin;
        
        var discounts = [];
        
        for(let i = 0; i < jsonData.length; i++){
            discounts.push({ 'zone': jsonData[i].zone, 'minReduction': minReduction, 'publishedMin': publishedMin});
        };
        console.log(discounts);
        component.set("v.minReductionRecords" ,discounts);
        window.setTimeout(
            $A.getCallback(function() {
                component.set("v.showSpinner",false);
            }), 1000
        ); 
        
    },
    
    
    saveDraft : function(component, event, helper) {
        component.set("v.showSpinner",true);
        var action = component.get("c.draftSave");
        var jsonData = JSON.parse(JSON.stringify(component.get("v.discountRecords")));
        console.log('jsonData'+jsonData);
        var discountslist = []
        for(let i = 0; i < jsonData.length; i++){
            discountslist.push({ 'zone': jsonData[i].zone, 'earnedDiscount': jsonData[i].earnedDiscount, 'autoBonusDiscount': jsonData[i].autoBonusDiscount, 'discount':jsonData[i].discount,'minReduction':jsonData[i].minReduction,'publishedMin':jsonData[i].publishedMin ,'publishedMinWeight':jsonData[i].publishedMinWeight,'publishedMinZone':jsonData[i].publishedMinZone,'carrier':component.get("v.selectedCarrier"),'serviceTypes' : component.get("v.selectedServiceType"),'servicePackaging':component.get("v.selectedPackaging")})
        }   
        
        action.setParams({
            "discounts":JSON.stringify(discountslist),
        });
        //changed value of start
        action.setCallback(this,function(a){
            var successValue =  a.getReturnValue();
            //alert('successValue'+successValue);
            component.set("v.success",successValue);
            component.set("v.SuccessTrue",false);
        });
        //changed value of end.
        console.log('discountslist'+JSON.stringify(discountslist));       
        window.setTimeout(
            $A.getCallback(function() {
                component.set("v.showSpinner",false);
            }), 500
        );   
        
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": "Success!",
            "message": "Draft entries successfully saved"
        });
        toastEvent.fire();  
        $A.enqueueAction(action);               
    },
    netRateSettingData : function(component, event, helper){
        var selectedNetRatesFromEvent = event.getParam("ListOfNetRateRecords");
        component.set('v.netRateMasterTable',selectedNetRatesFromEvent);
    }
    
})