public with sharing class getUserProfileController {

    @AuraEnabled
    public static String getUserProfile () {
        // Récupère le profil de l’utilisateur courant via son Id
        Profile p = [SELECT Name FROM Profile WHERE Id = :UserInfo.getProfileId()][0];
        
        // Retourne le nom du profil
        return p.Name;
    }
}