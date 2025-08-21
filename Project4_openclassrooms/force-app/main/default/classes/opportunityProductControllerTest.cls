@isTest
private class opportunityProductControllerTest {

    // Prépare les données de test (produits, prix, compte, opportunité, OLI)
    @TestSetup
    static void initData() {
        // Produits
        Product2 product  = new Product2(Name='Car Model X', isActive=true, QuantityInStock__c=10);
        Product2 product1 = new Product2(Name='Car Model Y', isActive=true, QuantityInStock__c=1);
        insert new List<Product2>{product, product1};

        // Pricebook standard obligatoire pour les OLI
        Id pricebookId = System.Test.getStandardPricebookId();
        PricebookEntry pbe  = new PricebookEntry(Pricebook2Id=pricebookId, Product2Id=product.Id,  UnitPrice=35000, IsActive=true);
        PricebookEntry pbe1 = new PricebookEntry(Pricebook2Id=pricebookId, Product2Id=product1.Id, UnitPrice=1000,  IsActive=true);
        insert new List<PricebookEntry>{pbe, pbe1};

        // Compte
        Account account = new Account(Name='TestAccount');
        insert account;

        // Opportunité
        Opportunity opportunity = new Opportunity(
            Name='TestOpportunity',
            AccountId=account.Id,
            Pricebook2Id=pricebookId,
            CloseDate=Date.today(),
            StageName='Closed Won'
        );
        insert opportunity;

        // OLI liés à l’opportunité
        OpportunityLineItem oppProduct  = new OpportunityLineItem(OpportunityId=opportunity.Id, PricebookEntryId=pbe.Id,  UnitPrice=54000, Quantity=10);
        OpportunityLineItem oppProduct1 = new OpportunityLineItem(OpportunityId=opportunity.Id, PricebookEntryId=pbe1.Id, UnitPrice=13000, Quantity=10);
        insert new List<OpportunityLineItem>{oppProduct, oppProduct1};
    }

    // Test de la récupération des OLI
    @isTest
    static void getOpportunityProductsTest() {
        Opportunity opportunity = [SELECT Id FROM Opportunity LIMIT 1];

        List<OpportunityLineItem> items = opportunityProductController.getOpportunityProducts(opportunity.Id);

        System.assertEquals(2, items.size(), 'On doit récupérer 2 OLI');
    }

    // Test de la suppression d’un OLI
    @isTest
    static void deleteOpportunityProductsTest() {
        OpportunityLineItem oli = [SELECT Id FROM OpportunityLineItem LIMIT 1];

        Integer beforeCount = [SELECT COUNT() FROM OpportunityLineItem WHERE Id = :oli.Id];
        System.assertEquals(1, beforeCount, 'Le record doit exister avant suppression');

        opportunityProductController.deleteOpportunityProduct(oli.Id);

        Integer afterCount = [SELECT COUNT() FROM OpportunityLineItem WHERE Id = :oli.Id];
        System.assertEquals(0, afterCount, 'Le record doit être supprimé');
    }
}