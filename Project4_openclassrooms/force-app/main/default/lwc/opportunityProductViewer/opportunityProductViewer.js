import { LightningElement, api, wire, track } from 'lwc';
import getOpportunityProducts from '@salesforce/apex/opportunityProductController.getOpportunityProducts';
import deleteOpportunityProduct from '@salesforce/apex/opportunityProductController.deleteOpportunityProduct';
import getUserProfile from '@salesforce/apex/getUserProfileController.getUserProfile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';

// Labels personnalisés (multilingue)
import LabelProductName from '@salesforce/label/c.Nom_Du_Produit';
import LabelQuantity from '@salesforce/label/c.Quantite';
import LabelUnitPrice from '@salesforce/label/c.Prix_unitaire';
import LabelTotalPrice from '@salesforce/label/c.Prix_total';
import LabelQuantityInStock from '@salesforce/label/c.Quantite_en_Stock';
import LabelDelete from '@salesforce/label/c.Supprimer';
import LabelSeeProduct from '@salesforce/label/c.Voir_produit';
import LabelNoProducts from '@salesforce/label/c.Vous_n_avez_aucune_ligne_de_produits_pour_le_moment_1_Veuille';
import LabelAlertQuantity from '@salesforce/label/c.Vous_avez_au_moins_une_ligne_avec_un_probl_me_de_quantit_veuillez_supprimer_ce';

export default class OpportunityProductViewer extends NavigationMixin(LightningElement) {
    @api recordId;              // Id de l’opportunité (fourni automatiquement par Salesforce)
    @track data = [];           // Données affichées dans le tableau
    noProducts = false;         // Vrai si aucune ligne de produit
    hasAlert = false;           // Vrai si une ligne a une quantité supérieure au stock
    isCommercial = false;       // Vrai si l’utilisateur est « commercial / sales »
    wiredResult;                // Référence du wire pour rafraîchir après suppression
    columns;                    // Définition des colonnes du tableau

    // Rassemble les labels pour simplifier l’accès
    label = {
        LabelProductName,
        LabelQuantity,
        LabelUnitPrice,
        LabelTotalPrice,
        LabelQuantityInStock,
        LabelDelete,
        LabelSeeProduct,
        LabelNoProducts,
        LabelAlertQuantity
    };

    // Au chargement du composant : vérifie le profil utilisateur
    connectedCallback() {
        getUserProfile()
            .then(profileName => {
                const normalized = profileName.toLowerCase();
                this.isCommercial =
                    normalized.includes('commercial') ||
                    normalized.includes('sales');
                this.setColumns(); // construit les colonnes en fonction du profil
            })
            .catch(() => {
                this.showToast('Erreur', 'Erreur lors de la récupération du profil.', 'error');
            });
    }

    // Définit les colonnes du tableau selon le profil
    setColumns() {
        const baseColumns = [
            { label: this.label.LabelProductName, fieldName: 'productName' },
            {
                label: this.label.LabelQuantity,
                fieldName: 'quantity',
                type: 'number',
                cellAttributes: {
                    class: { fieldName: 'quantityClass' },   // applique une couleur si alerte
                    style: { fieldName: 'quantityStyle' }    // applique un style si alerte
                }
            },
            { label: this.label.LabelUnitPrice, fieldName: 'unitPrice', type: 'currency' },
            { label: this.label.LabelTotalPrice, fieldName: 'totalPrice', type: 'currency' },
            { label: this.label.LabelQuantityInStock, fieldName: 'quantityInStock', type: 'number' }
        ];

        if (this.isCommercial) {
            // Pour les commerciaux : uniquement le bouton suppression
            baseColumns.push({
                label: this.label.LabelDelete,
                type: 'button',
                typeAttributes: {
                    iconName: 'utility:delete',
                    name: 'delete',
                    title: this.label.LabelDelete,
                    variant: 'destructive',
                    alternativeText: this.label.LabelDelete
                }
            });
        } else {
            // Pour les autres profils : bouton voir + bouton suppression
            baseColumns.push(
                {
                    label: this.label.LabelSeeProduct,
                    type: 'button',
                    typeAttributes: {
                        label: this.label.LabelSeeProduct,
                        name: 'view',
                        title: this.label.LabelSeeProduct,
                        variant: 'brand',
                        iconName: 'utility:preview'
                    }
                },
                {
                    label: this.label.LabelDelete,
                    type: 'button',
                    typeAttributes: {
                        name: 'delete',
                        title: this.label.LabelDelete,
                        variant: 'destructive',
                        iconName: 'utility:delete'
                    }
                }
            );
        }

        this.columns = baseColumns;
    }

    // Récupère les produits liés à l’opportunité
    @wire(getOpportunityProducts, { opportunityId: '$recordId' })
    wiredProducts(result) {
        this.wiredResult = result;
        const { data, error } = result;

        if (data) {
            this.noProducts = data.length === 0;
            this.hasAlert = false;

            // Transforme les données pour les afficher dans le tableau
            this.data = data.map(row => {
                const alert = row.Product2.QuantityInStock__c - row.Quantity < 0;
                if (alert) this.hasAlert = true;

                return {
                    productName: row.Product2.Name,
                    quantityInStock: row.Product2.QuantityInStock__c,
                    unitPrice: row.UnitPrice,
                    totalPrice: row.TotalPrice,
                    quantity: row.Quantity,
                    productId: row.Product2.Id,
                    Id: row.Id,
                    quantityClass: alert ? 'slds-text-color_error' : '',
                    quantityStyle: alert ? 'background:#f3f2f2;font-weight:700;' : ''
                };
            });
        } else if (error) {
            this.showToast('Erreur', 'Erreur de chargement des produits.', 'error');
        }
    }

    // Gère les actions sur les boutons de chaque ligne
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'delete') {
            this.deleteProduct(row.Id);
        } else if (actionName === 'view' && row.productId && !this.isCommercial) {
            // Navigation vers la fiche produit
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: { recordId: row.productId, actionName: 'view' }
            });
        }
    }

    // Supprime une ligne de produit puis recharge la liste
    deleteProduct(oliId) {
        deleteOpportunityProduct({ oliId })
            .then(() => {
                this.showToast('Succès', 'Produit supprimé avec succès.', 'success');
                return refreshApex(this.wiredResult);
            })
            .catch(() => {
                this.showToast('Erreur', 'Impossible de supprimer le produit.', 'error');
            });
    }

    // Affiche une notification (toast)
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}