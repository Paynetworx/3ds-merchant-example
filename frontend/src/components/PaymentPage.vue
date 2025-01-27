<template>
  <div class="container">
    <div v-if="isChallengeModalVisible" class="modal-overlay">
      <div class="modal">
        <div class="modal-content" id="challenge-modal">
        </div>
      </div>
    </div>
    <div v-if="isSuccessModalVisible" class="modal-overlay">
      <div class="modal">
        <div class="modal-content" id="success-modal">
          <h1> Success </h1>
          <button type="submit" @click="isSuccessModalVisible = false" >Close</button>
        </div>
      </div>
    </div>

    <div class="column">
      <div class="payment-page">
        <h2>Payment Details</h2>
        <div class="preset-selector">
          <label for="preset-select">Select a preset:</label>
          <select id="preset-select" v-model="selectedPreset" @change="applyPreset">
            <option value="">-- Select --</option>
            <option v-for="(preset, key) in presets" :key="key" :value="key">
              {{ preset.name }}
            </option>
          </select>
        </div>

        <form @submit.prevent="processPayment">
          <div class="form-group">
            <label for="cardNumber">Card Number</label>
            <input 
              type="text" 
              id="cardNumber" 
              v-model="paymentDetails.cardNumber" 
              placeholder="1234 5678 9012 3456" 
              required
            >
          </div>

          <div class="form-group">
            <label for="cardHolder">Card Holder</label>
            <input 
              type="text" 
              id="cardHolder" 
              v-model="paymentDetails.cardHolder" 
              placeholder="John Doe" 
              required
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="expiryDate">Expiry Date</label>
              <input 
                type="text" 
                id="expiryDate" 
                v-model="paymentDetails.expiryDate" 
                placeholder="MM/YY" 
                required
              >
            </div>
            <div class="form-group">
              <label for="cvv">CVV</label>
              <input 
                type="text" 
                id="cvv" 
                v-model="paymentDetails.cvv" 
                placeholder="123" 
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label for="amount">Amount</label>
            <input 
              type="string" 
              id="amount" 
              v-model="paymentDetails.amount" 
              placeholder="Enter amount" 
              required
            >
          </div>

          <button type="submit" :disabled="isProcessing">
            {{ isProcessing ? 'Processing...' : 'Pay Now' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import * as sdk from "@paynetworx/3ds-sdk"

interface PaymentDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  amount: string;
  browser_info?: any
}

interface Preset {
  name: string;
  data: PaymentDetails;
}

interface Presets {
  [key: string]: Preset;
}

const presets: Presets = {
  approve: {
    name: 'Approve',
    data: {
      cardNumber: '642854443658640',
      cardHolder: 'test',
      expiryDate: '1234',
      cvv: '123',
      amount: "10.00"
    }
  },
  denie: {
    name: 'Deny',
    data: {
      cardNumber: '2222222222222222',
      cardHolder: '1234',
      expiryDate: '1234',
      cvv: '123',
      amount: "10.00"
    }
  }
}
const selectedPreset = ref<string>('')
const paymentDetails = reactive<PaymentDetails>({
  cardNumber: '',
  cardHolder: '',
  expiryDate: '',
  cvv: '',
  amount: "10.00"
});

const applyPreset = (): void => {
  if (selectedPreset.value && presets[selectedPreset.value]) {
    Object.assign(paymentDetails, presets[selectedPreset.value].data)
  } else {
    Object.assign(paymentDetails, {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
      amount: "10.00"
    })
  }
}
const isProcessing = ref<boolean>(false);
const isChallengeModalVisible = ref<boolean>(false);
const isSuccessModalVisible = ref<boolean>(false);

const processPayment = async (): Promise<void> => {
  isProcessing.value = true;
  const backend_url = "http://localhost:8081"

  try {
    const result = await sdk.processPayment({
      paynetworx_url:"PNX_ENDPOINT_URL", //filled in by backend static methods
      //paynetworx_url:"http://localhost:8089",
      challenge_window_size:sdk.CHALLENGE_WINDOW_SIZE_500_600,
      sendPaymentToBackend: async (browser_info: unknown): Promise<sdk.CallbackResponse<unknown>> => {
        paymentDetails.browser_info=browser_info

        const response = await fetch(`${backend_url}/api/auth`,{
          method:'POST',
          body:JSON.stringify(paymentDetails),
          headers: {
            "Content-Type": "application/json",
          },
        })
        return await response.json() 
      },
      Get3dsMethodResponse: async (threeDSServerTransID: string): Promise<sdk.CallbackResponse<unknown>> => {
        const threeds_method_response = await fetch(`${backend_url}/api/3ds_method/${threeDSServerTransID}`,{
          method:'GET',
        })

        return await threeds_method_response.json()
      },
      StartChallengeCallback: async () =>{
        isChallengeModalVisible.value = true

        await waitForElement("#challenge-modal");
        return document.getElementById("challenge-modal")!
      },
      GetChallengeResponse: async (threeDSServerTransID: string): Promise<sdk.CallbackResponse<unknown>> => {
        const challenge_response = await fetch(`${backend_url}/api/challenge/${threeDSServerTransID}`,{
          method:'GET',
        })
        return await challenge_response.json()
      },
      FinishChallengeCallback: async () =>{
        isChallengeModalVisible.value = false
      },
    })
    console.log(result)
  } catch (error) {
    console.log(JSON.stringify(error,null,2))
  } finally {
    isSuccessModalVisible.value = true
    isProcessing.value = false;
  }
}

function waitForElement(selector: string) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            resolve(document.querySelector(selector));
            return;
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
</script>

<style scoped>
.payment-page {
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

iframe {
  background-color: white;
  height:100%;
  width:100%;
}

.container {
  display: flex;
  width: 100%;
}

.column {
  flex: 4;
  padding: 50px;
  width:500px
}

/* Responsive layout - makes the columns stack on top of each other instead of next to each other on screens less than 600px wide */
@media screen and (max-width: 600px) {
  .container {
    flex-direction: column;
  }
}

.hidden {
  display: none;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: none;
}

.modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 5px;
    width: 80%;
    max-width: 500px;
    z-index: 1051;
}

</style>
