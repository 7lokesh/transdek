@isTest
public class CreateClonedContractRecords_Test {
    public static testmethod void fetchContractRecord_Test(){
        Account acc = new Account();
        acc.Name = 'test account';
        insert acc;
        Customer_Contract__c customercontract = new Customer_Contract__c();
        customercontract.Name = 'test';
        customercontract.Customer__c = acc.Id;
        insert customercontract;
        
        Test.startTest();
        CreateClonedContractRecords.fetchContractRecord(customercontract.Id);
        Test.stopTest();
        
    }
    @isTest
    public static void fetchLookUpValues_Test(){
        string textValue = 'test';
        Account acc = new Account();
        acc.Name = 'test';
        insert acc;
        Customer_Contract__c customercontract = new Customer_Contract__c();
        customercontract.Name = 'test';
        customercontract.Customer__c = acc.Id;
        insert customercontract;
              
        Test.startTest();
        CreateClonedContractRecords.fetchLookUpValues(textValue,'customercontract',customercontract.id);
        Test.stopTest();
    }
    @isTest
    public static void createContactRecord_Test(){
        Account acc = new Account();
        acc.Name = 'test';
        insert acc;
        
        Customer_Contract__c customercontract = new Customer_Contract__c();
        customercontract.Name = 'test';
        customercontract.Customer__c = acc.Id;
        insert customercontract;
        
        Shipping_Method__c sm = new Shipping_Method__c();
        sm.Name = 'test';
        sm.Carrier__c = 'FedEx';
        insert sm;
       
        Net_Rate__c netrate = new Net_Rate__c();
        netrate.Name = 'test';
        netrate.Customer_Contract__c = customercontract.Id;
        netrate.Shipping_Method__c = sm.id;
        netrate.Year__c = '2022';
        netrate.Zone__c = '2';
        netrate.Contract_Discount__c = 23;
        netrate.Net_Effective_Discount__c = 3.8;
        netrate.Min_Reduction__c = 1000;
        netrate.Min_Charge_Amount__c = 1000;
        netrate.Leakage__c = 1000;
        netrate.Minimum_Used__c = true;
        
        insert netrate;
        
        CreateClonedContractRecords.createContactRecord(customercontract, acc.Id);
    } 
}