@isTest
private class getUserProfileControllerTest {

    @isTest
    static void myUnitTest() {
        // Appelle la méthode du contrôleur
        String result = getUserProfileController.getUserProfile();
        
        // Vérifie que le résultat n’est pas nul (le nom du profil doit exister)
        System.assertNotEquals(null, result);
    }
}