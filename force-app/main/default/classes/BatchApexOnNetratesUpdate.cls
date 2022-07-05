public class BatchApexOnNetratesUpdate implements Database.Batchable<sObject>{
    public string carrier;
    public string serviceType;
    public string selectedPackaging;
    public string impExpSelection;
    public date effDate;
    
    public BatchApexOnNetratesUpdate(String carr, String serviceType, String selPackaging, String impExpSelection,Date effDate){
        carrier=carr;
        serviceType=serviceType;
        selectedPackaging=selPackaging;
        impExpSelection=impExpSelection;
        effDate=effDate;
        system.debug('carrier inside of cons'+carrier);
        system.debug('serviceType inside of cons'+serviceType);
        system.debug('selectedPackaging inside of cons'+selectedPackaging);
        system.debug('impExpSelection inside of cons'+impExpSelection);
        system.debug('effDate inside of cons'+effDate);
    } 
    
    public Database.QueryLocator start(Database.BatchableContext BC){
        string query = 'SELECT id,Carrier__c,Service_Type__c,Effective_Date__c,Zone__c,Service_Packaging__c,(SELECT Id,Service_Packaging__c,Import_Export__c,Effective_Date__c from Net_Rates__r) FROM Published_Rate__c where Carrier__c=:carrier and Service_Packaging__c =:selectedPackaging and Service_Type__c=:serviceType and Effective_Date__c = :effDate';
        return Database.getQueryLocator(query);
    }
    public void execute(Database.BatchableContext BC, List<Published_Rate__c> listOfpublishedRecords){
        for(Published_Rate__c eachPr : listOfpublishedRecords){
            for(Net_Rate__c eachNetRate : eachPr.Net_Rates__r){
                
            }
        }
       // update scope;
    }
    
    public void finish(Database.BatchableContext BC){
    }
    
}