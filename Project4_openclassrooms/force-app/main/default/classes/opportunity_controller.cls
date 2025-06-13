public with sharing class opportunity_controller {
    public static List<Opportunitylineitem> getOpportunitiesProduct(String opportunityId) {
        
        List<Opportunitylineitem> opportunities_product = [SELECT Id FROM Opportunitylineitem WHERE OpportunityId = :opportunityId];
        return opportunities_product;
    }