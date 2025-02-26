import { Injectable } from '@angular/core';
import { loadMercadoPago } from "@mercadopago/sdk-js";
import { NotificationService } from '../shared/notification/notification.service';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private readonly publicKey = 'YOUR_MERCADO_PAGO_PUBLIC_KEY';
  private readonly apiUrl: string = 'YOUR_API_URL';
  private mp: any;

  constructor(
    private notificationService: NotificationService,
  ) {}

  public async loadMp(amount: string) {
    await loadMercadoPago();
    this.mp = new window.MercadoPago(this.publicKey)

    const cardForm = this.mp.cardForm({
      amount: amount,
      iframe: true,
      form: {
        id: "form-checkout",
        cardNumber: {
          id: "form-checkout__cardNumber",
          placeholder: "Card Number",
        },
        expirationDate: {
          id: "form-checkout__expirationDate",
          placeholder: "MM/YY",
        },
        securityCode: {
          id: "form-checkout__securityCode",
          placeholder: "Security Code",
        },
        cardholderName: {
          id: "form-checkout__cardholderName",
          placeholder: "Cardholder Name",
        },
        issuer: {
          id: "form-checkout__issuer",
          placeholder: "Issuer",
        },
        installments: {
          id: "form-checkout__installments",
          placeholder: "Installments",
        },
        identificationType: {
          id: "form-checkout__identificationType",
          placeholder: "Document Type",
        },
        identificationNumber: {
          id: "form-checkout__identificationNumber",
          placeholder: "Document Number",
        },
        cardholderEmail: {
          id: "form-checkout__cardholderEmail",
          placeholder: "Email",
        },
      },
      callbacks: {
        onFormMounted: (error: Error) => {
          if (error) {
            this.notificationService.showError('Error', 'Failed to load the form. Please try again later.');
            return console.warn("Form Mounted handling error:", error);
          }
          console.log("Form mounted");
        },
        onSubmit: (event: Event) => {
          event.preventDefault();

          const {
            paymentMethodId: payment_method_id,
            issuerId: issuer_id,
            cardholderEmail: email,
            amount,
            token,
            installments,
            identificationNumber,
            identificationType,
          } = cardForm.getCardFormData();

          fetch(this.apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
              issuer_id,
              payment_method_id,
              transaction_amount: Number(amount),
              installments: Number(installments),
              description: "Product Description",
              payer: {
                email,
                identification: {
                  type: identificationType,
                  number: identificationNumber,
                },
              }
            }),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error("Failed to process payment");
            }
            return response.json();
          })
          .then(data => console.log("Payment processed:", data))
          .catch(error => console.error("Payment error:", error));
        },
        onFetching: (resource: any) => {
          console.log("Fetching resource: ", resource);
        }
      }
    })
  }
}