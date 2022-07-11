global class BatchApexOnNetratesUpdate implements Database.Batchable<sObject>{
    global string carrier;
    global string serviceType;
    global string selectedPackaging;
    global string impExpSelection;
    global date effDate;
    
     global BatchApexOnNetratesUpdate(String carr, String serviceType, String selPackaging, String impExpSelection,Date effDate){
        this.carrier=carr;
        this.serviceType=serviceType;
        this.selectedPackaging=selPackaging;
        this.impExpSelection=impExpSelection;
        this.effDate=effDate;
        system.debug('carrier inside of cons'+carrier);
        system.debug('serviceType inside of cons'+serviceType);
        system.debug('selectedPackaging inside of cons'+selectedPackaging);
        system.debug('impExpSelection inside of cons'+impExpSelection);
        system.debug('effDate inside of cons'+effDate);
    } 
    
    
    global Database.QueryLocator start(Database.BatchableContext BC){
        system.debug('inside start');
        string query = 'SELECT id,Carrier__c,Service_Type__c,Effective_Date__c,Zone__c,Service_Packaging__c FROM Published_Rate__c where Carrier__c=:carrier and Service_Packaging__c =:selectedPackaging and Service_Type__c=:serviceType';
        system.debug('query'+query);
        return Database.getQueryLocator(query);
    }
    global void execute(Database.BatchableContext BC, List<Published_Rate__c> listOfpublishedRecords){
        Set<string> zoneSet = new Set<string>();
        system.debug('listOfpublishedRecords'+listOfpublishedRecords);
        for(Published_Rate__c pr : listOfpublishedRecords){
            zoneSet.add(pr.Zone__c);
        }        
        List<string> zones = new List<string>(zoneSet);
        zones.sort();
        system.debug('zones of batch class'+zones);
        for(Published_Rate__c eachPr : listOfpublishedRecords){
            for(Net_Rate__c eachNetRate : eachPr.Net_Rates__r){
                
            }
        }
       // update scope;
    }
    
    global void finish(Database.BatchableContext BC){
    }
    
}