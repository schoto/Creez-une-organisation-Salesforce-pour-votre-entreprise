public with sharing class opportunityProductController {

    // Méthode appelée par LWC pour récupérer les produits liés à une opportunité
    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> getOpportunityProducts(Id opportunityId) {
        return [
            SELECT Id, Quantity, UnitPrice, TotalPrice,
                   Product2.Id, Product2.Name, Product2.QuantityInStock__c
            FROM OpportunityLineItem
            WHERE OpportunityId = :opportunityId
        ];
    }

    // Méthode appelée par LWC pour supprimer une ligne produit
    @AuraEnabled
    public static void deleteOpportunityProduct(Id oliId) {
        delete [SELECT Id FROM OpportunityLineItem WHERE Id = :oliId LIMIT 1];
    }
}