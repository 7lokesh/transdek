public with sharing class ContractAndRateGenController {
    public ContractAndRateGenController() {
        
    }
    
    @AuraEnabled 
    public static List<string> getCarriers(){
        
        Set<string> carriers = new Set<string>();
        
        for(Shipping_Method__c sm : [select Name, Carrier__c from Shipping_Method__c]){
            carriers.add(sm.Carrier__c);
        }
        
        List<string> carrierList = new List<string>(carriers);
        return carrierList;
        
    }
    
    @AuraEnabled 
    public static List<Shipping_Method__c> getServiceTypes(string carrier){
        List<string> listOfStrings = new List<string>();
        List<Shipping_Method__c> serviceTypes = new List<Shipping_Method__c>();
        
        serviceTypes = [select Id, Name,Associated_Service_for_Rates__c from Shipping_Method__c where Carrier__c = :carrier order by Name asc];
        for(Integer i=0;i<serviceTypes.size();i++){
            serviceTypes[i].Associated_Service_for_Rates__c=serviceTypes[i].Associated_Service_for_Rates__c==NULL?serviceTypes[i].Id:serviceTypes[i].Associated_Service_for_Rates__c;
        }
        return serviceTypes;
        
    }
    
    @AuraEnabled //instead of year pass an date field.
    public static List<string> getServiceZones(string carrier, date effDate, string serviceType, string packaging){        
        Set<string> zoneSet = new Set<string>(); 
		Shipping_Method__c smRecord = [SELECT Id,Name FROM Shipping_Method__c WHERE Id=:serviceType];
        for(Published_Rate__c pr : [select Zone__c,Effective_Date__c from Published_Rate__c where Carrier__c = :carrier and Effective_Date__c = :effDate and Service_Type__c = :serviceType and Service_Packaging__c = :packaging]){
            zoneSet.add(pr.Zone__c);
        }        
        List<string> zones = new List<string>(zoneSet);
        zones.sort();
        system.debug('zones'+zones);
        return zones;
    }
    
    @AuraEnabled 
    public static List<string> getServicePackagingList(){
        List<string> opts = new List<string>();
        
        //gather list based on campus picklist from student program
        Schema.DescribeFieldResult dfr = Schema.sObjectType.Published_Rate__c.fields.Service_Packaging__c;
        List<Schema.PicklistEntry> entries = dfr.getPicklistValues();
        
        for(Schema.PicklistEntry e : entries){
            if(e.isActive()){
                opts.add(e.getLabel());
            }
        }
        
        return opts;
    }
   @AuraEnabled 
    public static Map<string, NetRate> buildRateTables_v2(string carrier, date effDate, string serviceType, string packaging, string discounts, string minReductions, string weightDiscounts){
        
        system.debug(discounts);
        system.debug(minReductions);
        system.debug(weightDiscounts);
        
        Map<string, NetRate> netRateMap = new Map<string, NetRate>();
        
        List<Discount> discountList = new List<Discount>();
        if(discounts != null && discounts != ''){
            discountList = (List<Discount>)JSON.deserialize(discounts, List<Discount>.class);
            system.debug('discountList'+discountList);
        }
        List<MinReduction> minReductionList = new List<MinReduction>();
        if(minReductions != null && minReductions != ''){
            minReductionList = (List<MinReduction>)JSON.deserialize(minReductions, List<MinReduction>.class);
            system.debug('minReductionList'+minReductionList);
        }
        List<WeightDiscount> weightDiscountList = new List<WeightDiscount>();
        if(weightDiscounts != null && weightDiscounts != ''){
            weightDiscountList = (List<WeightDiscount>)JSON.deserialize(weightDiscounts, List<WeightDiscount>.class);
            system.debug('weightDiscountList'+weightDiscountList);
        }
        
        //Date rateYear = Date.newInstance(Integer.valueOf(year), 1, 1);
        
        Set<string> zoneSet = new Set<string>();
        Set<string> weightZones = new Set<string>();
        Set<string> weightSet = new Set<string>();
        
        Map<string, Discount> discountMap = new Map<string, Discount>();
        Map<string, MinReduction> minReductionMap = new Map<string, MinReduction>();
        Map<string, List<WeightDiscount>> weightDiscountMap = new Map<string, List<WeightDiscount>>();
        
        for(Discount d : discountList){
            string z = d.zone;
            system.debug('zone in discount list: ' + z);
            
            if(d.earnedDiscount != null || d.autoBonusDiscount != null || d.discount != null){
                zoneSet.add(z);
                discountMap.put(z, d);
            }         
        }
        
        for(MinReduction mr : minReductionList){
            string z = mr.zone;
            system.debug('zone in min reduction list: ' + z);
            
            if(mr.publishedMin != null || mr.minReduction != null){
                zoneSet.add(z);
                minReductionMap.put(z, mr);
            }            
        }
        
        for(WeightDiscount wd : weightDiscountList){
            
            if(wd.discount != null && wd.discount != ''){
                
                if(wd.selectedZones != null){
                    for(string z : wd.selectedZones){
                        zoneSet.add(z);
                        
                        List<WeightDiscount> disc = new List<WeightDiscount>();
                        if(weightDiscountMap.containsKey(z)){
                            disc = weightDiscountMap.get(z);
                        }
                        disc.add(wd);
                        weightDiscountMap.put(z, disc);
                        
                    }
                }
                
            }
        }
        
        //gather all the matching published rates
        for(Published_Rate__c pr : [select Id, Zone__c, Rate__c, Effective_Date__c, Weight__c, Service_Packaging__c from Published_Rate__c where Carrier__c = :carrier and Effective_Date__c = :effDate and Service_Type__c = :serviceType and Zone__c in :zoneSet and Service_Packaging__c = :packaging ORDER BY Weight__c ASC]){
            string zone = pr.Zone__c;
            
            if(zone == null || zone == ''){
                zone = '0';
            }
            
            //get discounts
            Discount d = discountMap.get(zone);
            
            //get min reductions
            MinReduction mr = minReductionMap.get(zone);
            
            //get weight discounts
            List<WeightDiscount> wd = weightDiscountMap.get(zone);
            
            
            string mapKey = zone + '|' + pr.Weight__c;
            
            NetRate nr = null;
            if(netRateMap.containsKey(mapKey)){
                nr = netRateMap.get(mapKey);
                
                if(nr.effectiveDate < pr.Effective_Date__c){
                    //there is a newer published rate for this selection
                    nr = new NetRate();
                    nr.weight = pr.Weight__c;
                    nr.zone = zone;
                    nr.publishedRate = pr.Rate__c;
                    nr.netRate = pr.Rate__c;//default to published rate
                    nr.publishedRateId = pr.Id;
                    nr.selDate =effDate; //newly assigned date variable.
                    //nr.year = year;
                    nr.serviceType = serviceType;
                    nr.effectiveDate = pr.Effective_Date__c;
                    nr.packaging = pr.Service_Packaging__c;
                }
                
            }
            else{
                nr = new NetRate();
                nr.weight = pr.Weight__c;
                nr.zone = zone;
                nr.publishedRate = pr.Rate__c;
                nr.netRate = pr.Rate__c;//default to published rate
                nr.publishedRateId = pr.Id;
                nr.selDate =effDate;//newly assigned date variable.
                //nr.year = year;
                nr.serviceType = serviceType;
                nr.effectiveDate = pr.Effective_Date__c;
                nr.packaging = pr.Service_Packaging__c;
            }
            
            //apply discounts
            if(d != null){
                nr.earnedDiscount = d.earnedDiscount != null && d.earnedDiscount != '' ? Double.valueOf(d.earnedDiscount) : 0;
                nr.autoBonusDiscount = d.autoBonusDiscount != null && d.autoBonusDiscount != '' ? Double.valueOf(d.autoBonusDiscount) : 0;
                nr.discount = d.discount != null && d.discount != '' ? Double.valueOf(d.discount) : 0;
                nr.publishedMin = d.publishedMin != null && d.publishedMin != '' ? Double.valueOf(d.publishedMin) : 0;
                nr.minReduction = d.minReduction != null && d.minReduction != '' ? Double.valueOf(d.minReduction) : 0;
            }
            
            if(wd != null){
                for(WeightDiscount w : wd){
                    Integer weightMin = w.weightMin != null && w.weightMin != '' ? Integer.valueOf(w.weightMin) : 0;
                    Integer weightMax = w.weightMax != null && w.weightMax != '' ? Integer.valueOf(w.weightMax) : 0;
                    
                    if(pr.Weight__c >= weightMin && pr.Weight__c <= weightMax){
                        system.debug('weight found in range');
                        if(w.discount != null){
                            nr.weightDiscount = Double.valueOf(w.discount);
                        }
                    }
                    
                }
                
            }
            
            
            if(nr.totalExpectedDiscount != null && nr.totalExpectedDiscount > 0){
                netRateMap.put(mapKey, nr);
            }
            
            
        }
        system.debug('keys of map'+netRateMap.keyset());
        system.debug('values of map'+netRateMap.values());
        system.debug('netRateMap'+netRateMap);
       
        return netRateMap;
        
        
    } 
    
    @AuraEnabled 
    public static string saveRateData(string netRateList, Customer_Contract__c contract, string importExport,string otherServices){
              
         List<serviceTypeWrapper> serviceTyList = new List<serviceTypeWrapper>();
                if(otherServices != null && otherServices != ''){ 
            serviceTyList = (List<serviceTypeWrapper>)JSON.deserialize(otherServices, List<serviceTypeWrapper>.class);
        }
        
        List<NetRate> netRates = (List<NetRate>)JSON.deserialize(netRateList, List<NetRate>.class);    
        List<Net_Rate__c> ratesToCreate = new List<Net_Rate__c>();
       for(serviceTypeWrapper stw : serviceTyList){
        for(NetRate nr : netRates){
            Net_Rate__c rate = new Net_Rate__c();
            //rate.Id = nr.netRateRecordId;
            //system.debug('netRateRecordId'+nr.netRateRecordId);
            rate.Published_Minimum__c = nr.publishedMinimum;
            rate.Expected_Net_Rate__c = nr.expectedNetRate;
            rate.Weight_Discount__c=  nr.weightDiscount;
            rate.Minimum_Used__c = nr.minimumUsed;
            rate.Customer_Contract__c = contract.Id;
            rate.Name = 'TBD';
            rate.Year__c = nr.year; 
            rate.Effective_Date__c = nr.selDate;
            rate.Shipping_Method__c = stw.id;
            rate.Weight__c = nr.weight;
            rate.Zone__c = nr.zone;
            rate.Rate__c = nr.netRate;
            rate.Published_Rate__c = nr.publishedRateId;
            rate.Earned_Discount__c = nr.earnedDiscount != null ? Double.valueOf(nr.earnedDiscount) : null;
            rate.Weight_Discount__c = nr.weightDiscount != null ? Double.valueOf(nr.weightDiscount) : null;
            rate.Min_Charge_Amount__c = nr.minChargeAmount;
            rate.Contract_Discount__c = nr.totalExpectedDiscount*100;
            rate.Leakage__c = nr.leakage;
            rate.Net_Effective_Discount__c = nr.netEffectiveDiscount*100;
            rate.Minimum_Used__c = nr.minimumUsed;
            rate.Min_Reduction__c = nr.minReduction;
            rate.Unique_ID__c = contract.Customer__r.Name + '-' + String.valueOf(nr.selDate) + '-' + stw.id + '-Weight ' + nr.weight + '-Zone ' + nr.zone + '-' + nr.packaging + (importExport != null && importExport != '' ? '-' + importExport : '');
            rate.Import_Export__c = importExport;
            rate.Service_Packaging__c = nr.packaging;
            
            ratesToCreate.add(rate);      
        }
        }
        Database.upsert(ratesToCreate, Net_Rate__c.Fields.Unique_ID__c);
        return 'Success';
    }
    
    public class NetRate{
        @AuraEnabled public double weight;
        @AuraEnabled public string zone;
        @AuraEnabled public double publishedRate;
        @AuraEnabled public decimal publishedMinimum;
        @AuraEnabled public String netRateRecordId;
        //@AuraEnabled public decimal expectedNetRate;
        //@AuraEnabled public decimal weightDiscount;
        //@AuraEnabled public boolean minimumUsed;
        @AuraEnabled public double netRate {
            get{ 
                //double totalDiscounts = (earnedDiscount == null ? 0 : earnedDiscount) + (weightDiscount == null ? 0 : weightDiscount) + (autoBonusDiscount == null ? 0 : autoBonusDiscount) + (discount == null ? 0 : discount);
                double nr = publishedRate - (publishedRate*(totalExpectedDiscount));
                
                /*
if(minReduction != null && minReduction > 0 && nr < (publishedRate - minReduction)){
return (publishedRate - minReduction);
}

*/
                if(minChargeAmount != null && minChargeAmount > 0 && nr < minChargeAmount){
                    //minimumUsed = true;
                    return minChargeAmount;
                }
                
                
                return nr;
            }
            set;
        }
        @AuraEnabled public string publishedRateId;
        @AuraEnabled public double earnedDiscount;
        @AuraEnabled public double weightDiscount;
        @AuraEnabled public double publishedMin;
        @AuraEnabled public double minReduction;
        @AuraEnabled public double autoBonusDiscount;
        @AuraEnabled public double discount;
        @AuraEnabled public Date selDate;//newly createddate variable
        @AuraEnabled public string year;
        @AuraEnabled public string serviceType;
        @AuraEnabled public string packaging;
        @AuraEnabled public date effectiveDate;
        @AuraEnabled public double totalExpectedDiscount{
            get{
                return ((earnedDiscount == null ? 0 : earnedDiscount) + (weightDiscount == null ? 0 : weightDiscount) + (autoBonusDiscount == null ? 0 : autoBonusDiscount) + (discount == null ? 0 : discount))/100;
            }
            set;
        }
        @AuraEnabled public double minChargeAmount{
            get{
                if(publishedMin != null){
                    if(minReduction != null){
                        return publishedMin - minReduction;
                    }
                    else{
                        return publishedMin;
                    }
                }
                return 0;
            }
            set;
        }
        
        @AuraEnabled public boolean minimumUsed{
            get{
                if(netRate == minChargeAmount){
                    return true;
                }
                return false;
            }
            set;
        }
        
        @AuraEnabled public double netEffectiveDiscount{
            get{
                if(publishedRate == null){
                    return 0;
                }
                return (publishedRate - netRate)/publishedRate;
            }
            set;
        }
        
        @AuraEnabled public double expectedNetRate{
            get{
                if(publishedRate == null){
                    return 0;
                }
                return publishedRate - (publishedRate * (totalExpectedDiscount == null ? 0 : totalExpectedDiscount));
            }
            set;
        }
        
        @AuraEnabled public double leakage{
            get{
                return (netRate == null ? 0 : netRate) - (expectedNetRate == null ? 0 : expectedNetRate);
            }
            set;
        }
    }
    
    //draft save 
    @AuraEnabled
    public static string draftSave(String discounts){
        List<Discount> discountList = new List<Discount>();
        
        discountList = (List<Discount>)JSON.deserialize(discounts, List<Discount>.class);
        
        List<Draft_Rate_Discount_Entries__c> drlist= new List<Draft_Rate_Discount_Entries__c>();
        
        List<Draft_Rate_Discount_Entries__c> Ldrlistupdate=[select id,Name,service_type__c,Discount__c,Service_packaging__c,Earned_Discount__c,Auto_bonus_discount__c,Min_Reduction__c,Published_Min__c,Published_Min_Weight__c,Published_Min_Zone__c,Status__c,Zone__c from Draft_Rate_Discount_Entries__c];
        List<Draft_Rate_Discount_Entries__c> drlistupdate= new List<Draft_Rate_Discount_Entries__c>();
        
        
        //if(Ldrlistupdate.size()==0){
            for(Discount dr:discountList){
                //if(dr.earnedDiscount !=null){
                    Draft_Rate_Discount_Entries__c ldr=new Draft_Rate_Discount_Entries__c();    
                    ldr.Name=dr.carrier;
                    ldr.service_type__c=dr.serviceTypes;
                    ldr.Discount__c=dr.discount;     
                    ldr.Service_packaging__c=dr.servicePackaging;
                    ldr.Earned_Discount__c=dr.earnedDiscount;
                    ldr.Auto_bonus_discount__c=dr.autoBonusDiscount;
                    ldr.Min_Reduction__c=dr.minReduction;
                    ldr.Published_Min__c=dr.publishedMin;
                    ldr.Zone__c=dr.zone;
               		ldr.Published_Min_Zone__c=dr.publishedMinZone;
                    ldr.Published_Min_Weight__c=dr.publishedMinWeight;
                    ldr.Status__c='Draft';    
                    drlist.add(ldr);
                //}
            
            }
            Database.upsert(drlist);
            
        
        if(Ldrlistupdate.size()>0){ 
            system.debug('Ldrlistupdate greater'+Ldrlistupdate);
            for(Draft_Rate_Discount_Entries__c drupdate:Ldrlistupdate){
                
                for(Discount dr:discountList){
                    
                    if(drupdate.Zone__c==dr.zone){
                        
                        drupdate.Discount__c=dr.discount; 
                        drupdate.Earned_Discount__c=dr.earnedDiscount;
                        drupdate.Auto_bonus_discount__c=dr.autoBonusDiscount;
                        drupdate.Min_Reduction__c=dr.minReduction;
                        drupdate.Published_Min__c=dr.publishedMin;
                        drupdate.Published_Min_Weight__c=dr.publishedMinWeight;
                        drupdate.Published_Min_Zone__c=dr.publishedMinZone;
                        drlistupdate.add(drupdate);
                    }
                                        
                }
            }
            system.debug('drlistupdate'+drlistupdate);
            update drlistupdate;             
        }
        //changed value of start
        return 'success';
        //changed value of end;
    }
    
    
    //get daft data
    @AuraEnabled
    public static List<Draft_Rate_Discount_Entries__c> getDraftdata(String carrier,String servicePackaging,string selectedServiceType){
        set<id> ids=new set<id>();
        List<Draft_Rate_Discount_Entries__c> Ldrlist=[select id,Name,service_type__c,Discount__c,Service_packaging__c,Earned_Discount__c,Auto_bonus_discount__c,Min_Reduction__c,Published_Min__c,Published_Min_Weight__c,Published_Min_Zone__c,Status__c,Zone__c from Draft_Rate_Discount_Entries__c where service_type__c=:selectedServiceType];
        for(Draft_Rate_Discount_Entries__c dr:Ldrlist){
            if(dr.Name==carrier && dr.Service_packaging__c==servicePackaging && dr.Status__c=='Draft'){                
                ids.add(dr.Id);
            }
        }
        return [select id,Name,service_type__c,Discount__c,Service_packaging__c,Earned_Discount__c,Auto_bonus_discount__c,Min_Reduction__c,Published_Min__c,Published_Min_Weight__c,Published_Min_Zone__c,Status__c,Zone__c from Draft_Rate_Discount_Entries__c where Id IN:ids];
        
    }
    @AuraEnabled
    public static void deleteDraft(){
        
        List<Draft_Rate_Discount_Entries__c> Ldrlist = [SELECT Id,Status__c FROM Draft_Rate_Discount_Entries__c where Status__c='Draft'];  
        
        delete Ldrlist;
        
    }
    public class serviceTypeWrapper{
        public string id;
        public string name;
    }
    public class Discount{
        public string id;
        public string zone;
        public string earnedDiscount;
        public string autoBonusDiscount;
        public string discount;
        public string publishedMin;
        public string minReduction;
        public string carrier;
        public string servicePackaging;
        public string serviceTypes;
        public integer publishedMinWeight;
        public string publishedMinZone;      
    }
    
    public class MinReduction{
        public string id;
        public string publishedMin;
        public string minReduction;
        public string zone;
    }
    
    public class WeightDiscount{
        public string discount;
        public string id;
        public string weightMin;
        public string weightMax;
        public string zone;
        public List<string> selectedZones;
    }
     @AuraEnabled
   public static String fetchNetRateRecords(Id recordId,Id servicetype, date selDate, string carrier, string selectedService){
       List<Netrates> listofnetrateWrapper = new List<Netrates>();
        List<Net_Rate__c> listofNetRates = [select Id,Name,Weight__c,Zone__c,Rate__c,year__c,Shipping_Method__r.Carrier__c,Published_Rate__c,Contract_Discount__c,Effective_Discount__c,
        Min_Reduction__c,Min_Charge_Amount__c,Published_Rate_Amount__c,Expected_Net_Rate__c,Leakage__c,Minimum_Used__c,
        Net_Effective_Discount__c,Service_Packaging__c,Effective_Date__c from Net_Rate__c where Customer_Contract__c=:recordId and Shipping_Method__c=:servicetype order by Weight__c, zone__c ASC];
        
       if(!listofNetRates.isEmpty()){
       for(Net_Rate__c nr : listofNetRates){
           if(nr.Effective_Date__c == selDate && nr.Shipping_Method__r.Carrier__c == carrier && nr.Service_Packaging__c == selectedService){
               Netrates obj=new Netrates();
               obj.netRecordId =nr.id;
               obj.weight = nr.Weight__c;
               obj.zone = nr.zone__c;
               obj.publishedRate = nr.Published_Rate_Amount__c;
               obj.netRate = nr.Rate__c;
               obj.totalExpectedDiscount = (nr.Contract_Discount__c)/100; 
               obj.netEffectiveDiscount = nr.Net_Effective_Discount__c/100;
               obj.minReduction = nr.Min_Reduction__c;
               obj.minChargeAmount = nr.Min_Charge_Amount__c;
               obj.expectedNetRate= nr.Effective_Discount__c;
               obj.leakage= nr.Leakage__c;
               obj.minimumUsed = nr.Minimum_Used__c;

               listofnetrateWrapper.add(obj);
           }
       }
       }
       return JSON.Serialize(listofnetrateWrapper);
    
   }
    public class Netrates{
        public decimal weight;
        public string zone;
        public decimal publishedRate;
        public decimal netRate;
        public decimal totalExpectedDiscount;
        public decimal netEffectiveDiscount;
        public decimal minReduction;
        public decimal minChargeAmount;
        public decimal expectedNetRate;
        public decimal leakage;
        public boolean minimumUsed;
        public Id netRecordId;
        
    }
    @AuraEnabled
    public static List<string> fetchDistinctDates(string carrier, string serviceType){
        List<Published_Rate__c> listOfPublishedRates = [SELECT Id,Name,Effective_Date__c FROM Published_Rate__c where Carrier__c =:carrier AND Service_Type__c=:serviceType];
        List<Date> distinctLastnames = new List<Date>();
        List<string> listOfStrings = new List<string>();

        for(Published_Rate__c publisedRate: listOfPublishedRates){           
            Boolean found = false;           
            for(Integer i=0; i< distinctLastnames.size(); i++){               
                if(publisedRate.Effective_Date__c==distinctLastnames[i]){ //Check if current lastname has been added yet                  
                    found=true;
                    break;                    
                }                
            }            
            if(!found){
                string dateString  =string.valueOf(publisedRate.Effective_Date__c);                
                listOfStrings.add(dateString);
                distinctLastnames.add(publisedRate.Effective_Date__c);                
            }            
        }
        return listOfStrings;
    }
    
    @AuraEnabled
    public static string fetchRateOnweightAndZone(String carrier, date selDate, String serviceType,String servicePackaging,String discounts){             

        integer selMonth = selDate.month();
        integer selDay = selDate.day();
        integer selYear = selDate.year();

        Date selDate1 = date.newinstance(selYear, selMonth, selDay);    
                
        List<Discount> discountList = new List<Discount>();
        discountList = (List<Discount>)JSON.deserialize(discounts, List<Discount>.class);
        List<Discount> discountListUpdated = new List<Discount>();
        
        List<Id> listOfPublishedRateIds= new List<Id>();
        List<Published_Rate__c> publishedrates = [SELECT Id,Weight__c,Zone__c,Rate__c FROM Published_Rate__c where Carrier__c = :carrier AND Service_Type__c = :serviceType AND Service_Packaging__c = :servicePackaging AND Effective_Date__c = :selDate];
        
        for(Published_Rate__c eachrate : publishedrates){
             for(Discount dr:discountList){
                 if(eachrate.Zone__c == dr.publishedMinZone && eachrate.Weight__c == dr.publishedMinWeight){
                   listOfPublishedRateIds.add(eachrate.Id);
                   dr.publishedMin=String.valueOf(eachrate.Rate__c);
                 }              
            }
        }
        return json.serialize(discountList);
    } 
 /*   @AuraEnabled
    public static void updateNetRateOnPublishedRates(string carrier, string servicetype,string selectedPackaging,Date effDate,string importExportSel){
        system.debug('carrier'+carrier);
        system.debug('servicetype'+servicetype);
        system.debug('selectedPackaging'+selectedPackaging);
        system.debug('effDate'+effDate);
        system.debug('importExportSel'+importExportSel);
        //return 'success';
        BatchApexOnNetratesUpdate netRateUpdate = new BatchApexOnNetratesUpdate(carrier,servicetype,selectedPackaging,importExportSel,effDate);
	}*/
}