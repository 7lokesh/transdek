@isTest
public with sharing class TestContractAndRateGenComp {

    @TestSetup 
    static void buildTestRecords(){

        Account a = new Account();
        a.Name = 'Test Company';
        insert a;

        Customer_Contract__c contract = new Customer_Contract__c();
        contract.Customer__c = a.Id;
        insert contract;

        Shipping_Method__c sm = new Shipping_Method__c();
        sm.Carrier__c = 'FedEx';
        sm.Name = 'Test Service Type';
        insert sm;

        Published_Rate__c pr = new Published_Rate__c();
        pr.Carrier__c = 'FedEx';
        pr.Effective_Date__c = date.today();
        pr.Weight__c = 1;
        pr.Zone__c = '2';
        pr.Service_Type__c = sm.Id;
        pr.Year__c = String.valueOf(date.today().year());
        pr.Effective_Date__c = date.today();
        pr.Rate__c = 10;
        pr.Service_Packaging__c = 'Customer Packaging';
        insert pr;
        
        Published_Rate__c pr2 = new Published_Rate__c();
        pr2.Carrier__c = 'FedEx';
        pr2.Effective_Date__c = date.today();
        pr2.Weight__c = 1;
        pr2.Zone__c = '2';
        pr2.Service_Type__c = sm.Id;
        pr2.Year__c = String.valueOf(date.today().year());
        pr2.Effective_Date__c = date.today().addMonths(1);
        pr2.Service_Packaging__c = 'Customer Packaging';
        insert pr2;

    }
    

    static testMethod void testRateGen(){

        string currentYear = String.valueOf(date.today().year());

        Shipping_Method__c sm = [select Id from Shipping_Method__c limit 1][0];
        Published_Rate__c pr = [select Id from Published_Rate__c limit 1][0];
        Customer_Contract__c c = [select Id, Customer__c, Customer__r.Name from Customer_Contract__c limit 1][0];

        ContractAndRateGenController.getCarriers();
        ContractAndRateGenController.getServiceTypes('FedEx');
        ContractAndRateGenController.getServiceZones('FedEx', date.today(), sm.Id, 'Customer Packaging');
        ContractAndRateGenController.getServicePackagingList();

        //generate list of discounts
        ContractAndRateGenController.Discount d = new ContractAndRateGenController.Discount();
        d.id = '2';
        d.earnedDiscount = '0.5';
        d.autoBonusDiscount = '0.1';
        d.zone = '2';
        d.publishedMinWeight = 4;
        d.publishedMinZone = '3';
        List<ContractAndRateGenController.Discount> dList = new List<ContractAndRateGenController.Discount>{d};

        ContractAndRateGenController.MinReduction mr = new ContractAndRateGenController.MinReduction();
        mr.id = '1';
        mr.publishedMin = '5';
        mr.zone = '2';
        List<ContractAndRateGenController.MinReduction> mrList = new List<ContractAndRateGenController.MinReduction>{mr};

        ContractAndRateGenController.WeightDiscount wd = new ContractAndRateGenController.WeightDiscount();
        wd.id = '1';
        wd.discount = '0.5';
        wd.weightMin = '1';
        wd.weightMax = '1';
        wd.zone = '2';
        wd.selectedZones = new List<string>{'1'};
        List<ContractAndRateGenController.WeightDiscount> wdList = new List<ContractAndRateGenController.WeightDiscount>{wd};

        ContractAndRateGenController.buildRateTables_v2('FedEx', date.today(), sm.Id, 'Customer Packaging', JSON.serialize(dList), JSON.serialize(mrList), JSON.serialize(wdList));

        ContractAndRateGenController.NetRate nr = new ContractAndRateGenController.NetRate();
        nr.weight = 1;
        nr.zone = '2';
        nr.publishedRate = 10;
        nr.publishedRateId = pr.Id;
        nr.earnedDiscount = 0.5;
        nr.weightDiscount = 0.5;
        nr.minChargeAmount = 5;
        nr.year = currentYear;
        nr.serviceType = sm.Id;
        nr.publishedMin = 5;
        
        Double netRate = nr.netRate;
        boolean minUsed = nr.minimumUsed;
        Double expectedDiscount = nr.totalExpectedDiscount;
        Double netEffective = nr.netEffectiveDiscount;
        Double leakage = nr.leakage;
        Double minChargeAmount = nr.minChargeAmount;
        
        List<Shipping_Method__c> listOfShipMethods = new List<Shipping_Method__c>();
        Shipping_Method__c shipmethod1 = new Shipping_Method__c();
        shipmethod1.Name = 'test shipment';
        shipmethod1.Carrier__c = 'FedEx';
        insert shipmethod1;
        listOfShipMethods.add(shipmethod1);

        List<ContractAndRateGenController.NetRate> nrList = new List<ContractAndRateGenController.NetRate>();
		nrList.add(nr);
        ContractAndRateGenController.saveRateData(JSON.serialize(nrList), c, '',json.serialize(listOfShipMethods));
        
        
        Draft_Rate_Discount_Entries__c draftRateDiscountentry = new Draft_Rate_Discount_Entries__c();
        draftRateDiscountentry.Name = 'test';
        draftRateDiscountentry.Service_packaging__c = 'test';
        draftRateDiscountentry.Status__c = 'Draft';
        
        insert draftRateDiscountentry;
        Test.startTest();
        ContractAndRateGenController.getDraftdata(draftRateDiscountentry.Name, draftRateDiscountentry.Service_packaging__c,shipmethod1.id);
        Test.stopTest();
        
        Draft_Rate_Discount_Entries__c draftRateDiscountentryDelete = new Draft_Rate_Discount_Entries__c();
        draftRateDiscountentryDelete.Name = 'test';
        draftRateDiscountentryDelete.Status__c = 'Draft';
        insert draftRateDiscountentryDelete;
        

        Draft_Rate_Discount_Entries__c draftDelete = [select id,name,Service_packaging__c,Status__c from Draft_Rate_Discount_Entries__c where id=:draftRateDiscountentryDelete.id];
        system.debug('draftDelete'+draftDelete);
        delete draftDelete;
        ContractAndRateGenController.deleteDraft();
        
        Account a = new Account();
        a.Name = 'Test Company';
        insert a;

        Customer_Contract__c contract = new Customer_Contract__c();
        contract.Customer__c = a.Id;
        insert contract;
		
        system.debug('contract'+contract.id);
        Shipping_Method__c shipmethod = new Shipping_Method__c();
        shipmethod.Name = 'test shipment';
        shipmethod.Carrier__c = 'FedEx';
        insert shipmethod;
        system.debug('shipment'+shipmethod.id);        
        
		Net_Rate__c netRate1 = new Net_Rate__c();
        netRate1.Shipping_Method__c = shipmethod.id;
        netRate1.Customer_Contract__c = contract.id;
        netRate1.Year__c = '2022';
        netRate1.Name = 'test';
        netRate1.Net_Effective_Discount__c = 30;
        netRate1.Contract_Discount__c = 30;
        netRate1.Min_Reduction__c = 1000;
        netRate1.Min_Charge_Amount__c = 1000;
        netRate1.Leakage__c = 1000;
        netRate1.Minimum_Used__c = true;
        netRate1.Service_Packaging__c = 'Customer Packaging';
        insert netRate1;
        system.debug('netrate'+netRate1.id);
        
        Published_Rate__c publisedRate = [SELECT Id,Name,Effective_Date__c FROM Published_Rate__c limit 1];
		Date effdate = publisedRate.Effective_Date__c;
		     
        ContractAndRateGenController.fetchNetRateRecords(contract.id, shipmethod.id, effdate, 'FedEx', 'Customer Packaging');
        
        Draft_Rate_Discount_Entries__c draftRecord = new Draft_Rate_Discount_Entries__c();
        draftRecord.Name = 'test';
        draftRecord.service_type__c = 'test';
        draftRecord.Discount__c = 'test dis';
        draftRecord.Service_packaging__c = 'service';
        draftRecord.Earned_Discount__c ='earned dis';
        draftRecord.Auto_bonus_discount__c = 'auto bonus dis';
        draftRecord.Min_Reduction__c = 'min redu';
        draftRecord.Published_Min__c = 'published min';
        draftRecord.Zone__c = '2';
        draftRecord.Status__c = 'draft';
        
        insert draftRecord;
        string testdraftrecord = json.serialize(draftRecord);
        system.debug('testdraftrecord'+testdraftrecord);
        
             
        ContractAndRateGenController.draftSave('['+testdraftrecord+']');
		ContractAndRateGenController.fetchDistinctDates('FedEx', sm.id );
       ContractAndRateGenController.fetchRateOnweightAndZone('FedEx', Date.today(), sm.id, 'Customer Packaging', '['+testdraftrecord+']');

    }
}