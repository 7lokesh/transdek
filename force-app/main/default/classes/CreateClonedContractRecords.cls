public class CreateClonedContractRecords {
    public static List<Net_Rate__c> listOfGlobalNetRates = new List<Net_Rate__c>();
    @AuraEnabled
    public static Customer_Contract__c fetchContractRecord(Id recordId){
        Customer_Contract__c customerContract = [SELECT Id,Name,Customer__c,Customer__r.Name FROM Customer_Contract__c where id=:recordId];
        return customerContract;
    }
    @AuraEnabled
    public static List<sObject> fetchLookUpValues(String searchKeyWord, String ObjectName, Id recordId){
        Customer_Contract__c customercontract = [select Id,Customer__r.Name,Customer__c from Customer_Contract__c where Id=:recordId];
        String searchKey = searchKeyWord + '%';
        
        List <sObject> returnList = new List <sObject>();
        
        // Create a Dynamic SOQL Query For Fetch Record List with LIMIT 5   
        //String sQuery =  'select id, Name from ' +Contact + 'where Name LIKE: searchKey';
        List <sObject> lstOfRecords = [select id,Name from Account where name like:searchKey And Id!=:customercontract.Customer__c];
        for (sObject obj: lstOfRecords) {
            returnList.add(obj);
        }
        return returnList;
    }
    @AuraEnabled
    public static string createContactRecord(Customer_Contract__c contract,string sendAccId){
        
        Customer_Contract__c contractRecord = new Customer_Contract__c();
        contractRecord.Name = contract.Name;
        contractRecord.Customer__c = sendAccId;
        
        insert contractRecord;
        
        system.debug('contractRecord'+contractRecord);
        
        Customer_Contract__c contractNewRecord = [select Id,Name,Customer__r.Name from Customer_Contract__c where id=:contractRecord.id];
        system.debug('contractNewRecord'+contractNewRecord);
        
        List<Net_Rate__c> listofNetRates = new List<Net_Rate__c>();
        List<Netrates> listofnetrateWrapper = new List<Netrates>();
        List<string> listofstrings = new List<string>();
        set<string> setOfUniqueIds = new set<string>();
        List<Net_Rate__c> lstNetRates = [SELECT Id,Name,Account__c,Customer_Contract__c,Customer_Contract__r.Name,zone__c,Weight__c,Rate__c,Min_Reduction__c,Effective_Date__c,
                                         Net_Effective_Discount__c,Contract_Discount__c,Expected_Net_Rate__c,Leakage__c,Service_Packaging__c,
                                         Earned_Discount__c,Min_Charge_Amount__c,Unique_ID__c,Published_Minimum__c,Minimum_Used__c,Import_Export__c,
                                         Weight_Discount__c,Published_Rate_Amount__c,Effective_Discount__c,Year__c,Shipping_Method__c,Shipping_Method__r.Carrier__c
                                         FROM Net_Rate__c WHERE Customer_Contract__c=:contract.Id];
        
        List<Shipping_Method__c> listOfShippingRecords = [SELECT Id,Name FROM Shipping_Method__c where Carrier__c = 'FedEx'];
        Map<String,Id> mapNameToId=new Map<String,Id>();
        for(Shipping_Method__c spm:listOfShippingRecords){
            mapNameToId.put(spm.Name,spm.Id);
        }
        system.debug('listOfShippingRecords'+listOfShippingRecords);
        
        system.debug('lstNetRates'+lstNetRates);
        system.debug('sendAccId'+sendAccId);
        
       List<string> distinctIds = new List<string>();
        for(Net_Rate__c eachrate : lstNetRates){
            string uniqueId = eachrate.Unique_ID__c.split('-')[4];
             Boolean found = false;           
            for(Integer i=0; i< distinctIds.size(); i++){               
                if(uniqueId==distinctIds[i]){ //Check if current lastname has been added yet                  
                    found=true;
                    //system.debug('inside for loop'+publisedRate.Effective_Date__c);
                    break;                    
                }                
            }            
            if(!found){
                //system.debug('inside if'+publisedRate.Effective_Date__c);
                //string dateString = string.valueOf(publisedRate.Effective_Date__c);
                uniqueId = eachrate.Unique_ID__c.split('-')[4];
                distinctIds.add(uniqueId);
                system.debug('uniqueId'+uniqueId);
                //distinctLastnames.add(publisedRate.Effective_Date__c);                
            }     
            //system.debug('uniqueId'+uniqueId);
            //setOfUniqueIds.add(uniqueId);
        }   
        system.debug('distinctIds'+distinctIds);
        
        for(Net_Rate__c eachNetrate : lstNetRates){
            //for(string eachstring : setOfUniqueIds){
                Net_Rate__c newRate = eachNetrate.clone(false, true);
                newRate.Shipping_Method__r.Carrier__c = eachNetrate.Shipping_Method__r.Carrier__c;
                newRate.Shipping_Method__c = eachNetrate.Shipping_Method__c;
                //newRate.Shipping_Method__c = eachNetrate.Shipping_Method__c;
                system.debug('shipping metho in for loop'+newRate.Shipping_Method__c);
                newRate.Year__c  = eachNetrate.Year__c;
                newRate.Zone__c = eachNetrate.Zone__c;
                newRate.Weight__c = eachNetrate.Weight__c;
                newRate.Rate__c = eachNetrate.Rate__c;
                newRate.Min_Reduction__c = eachNetrate.Min_Reduction__c;
                newRate.Net_Effective_Discount__c =eachNetrate.Net_Effective_Discount__c;
                newRate.Contract_Discount__c = eachNetrate.Contract_Discount__c;
                newRate.Expected_Net_Rate__c = eachNetrate.Expected_Net_Rate__c;
                newRate.Leakage__c = eachNetrate.Leakage__c;
                newRate.Service_Packaging__c = eachNetrate.Service_Packaging__c;
                newRate.Earned_Discount__c = eachNetrate.Earned_Discount__c;
                newRate.Min_Charge_Amount__c = eachNetrate.Min_Charge_Amount__c;
                
            	String 	uniqString=eachNetrate.Name.split('-')[3];
                
                newRate.Unique_ID__c =  contractNewRecord.Customer__r.Name+'-'+String.valueOf(eachNetrate.Effective_Date__c)+'-'+mapNameToId.get(uniqString)+'-Weight '+
                eachNetrate.Weight__c+'-Zone '+eachNetrate.Zone__c+'-'+eachNetrate.Service_Packaging__c;
                listofstrings.add('uniquelist'+newRate.Unique_ID__c);
                newRate.Published_Minimum__c = eachNetrate.Published_Minimum__c;
                newRate.Minimum_Used__c = eachNetrate.Minimum_Used__c;
                newRate.Import_Export__c = eachNetrate.Import_Export__c;
                newRate.Weight_Discount__c = eachNetrate.Weight_Discount__c;
                newRate.Customer_Contract__c = contractRecord.Id;  
                listofNetRates.add(newRate);
            //}
        }
        system.debug('listofNetRates'+listofNetRates);
        system.debug('list of stirngs!!!!!'+listofstrings);
        for(string eachstring : listofstrings){
            system.debug('eachstring>>'+eachstring);
        }
        try{
            //Net_Rate__c.Fields.Unique_ID__c
            //insert listofNetRates;
            database.upsert(listofNetRates,Net_Rate__c.Fields.Unique_ID__c);
        }catch(Exception ex){
            system.debug('catch message');
            listofNetRates[0].Unique_ID__c='Error occured at '+System.now();
            insert listofNetRates;
        }
        
        
        if(!listofNetRates.isEmpty()){
            for(Net_Rate__c eachNetrate : listofNetRates){
                Netrates obj=new Netrates();
                obj.netRecordId =eachNetrate.Id;
                obj.weight = eachNetrate.Weight__c;
                obj.zone = eachNetrate.zone__c;
                obj.publishedRate = eachNetrate.Published_Rate_Amount__c;
                obj.netRate = eachNetrate.Rate__c;
                obj.totalExpectedDiscount = (eachNetrate.Contract_Discount__c)/100; 
                obj.netEffectiveDiscount = eachNetrate.Net_Effective_Discount__c/100;
                obj.minReduction = eachNetrate.Min_Reduction__c;
                obj.minChargeAmount = eachNetrate.Min_Charge_Amount__c;
                obj.expectedNetRate= eachNetrate.Effective_Discount__c;
                obj.leakage= eachNetrate.Leakage__c;
                obj.minimumUsed = eachNetrate.Minimum_Used__c;
                
                listofnetrateWrapper.add(obj);   
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
}