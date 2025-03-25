package tests

import (
	"bobo/middlewares"
	"bobo/utils"
	"encoding/json"
	"fmt"
	"testing"
)

func TestMiddle(t *testing.T) {
	dataHash := "0xb5f8d8a2fd20efa3dc99ebdf241cf8f065fdf790bb1ba1279ec9078579665b24"
	pubKey := "0x021fa0e1365c66c3e72df5eaa9a4be68bf0c911cd6a792c435121d4b49efb17d26"
	sign := "0x2fc3a52a14f32c0dfa9d71a2012c3eb7381b3600dcf8b9c0d3e53eb2aff4f56138ee1c9bada926642a8d347d9bcfb06a829b25e4b9202d6eb4d1f8f1baaaae9e1c"
	timeVal := "1720690255769"

	address, err := utils.RecoverAddress(dataHash, sign)
	fmt.Println("address=", address, err)
	wallet, _ := utils.GetWallet()
	sharedSecret, err := wallet.ComputeSharedSecret(pubKey)
	if err != nil {
		fmt.Println("[sharedSecret] err", err)
	}
	fmt.Println("[sharedSecret]==", sharedSecret)
	encData := "965911a45cf7034e91acc1d2ca25ec4930eb8a87771ee5e7107ec931775a03d3"
	deData, err := utils.AesDecrypt(sharedSecret, encData)
	if err != nil {
		fmt.Println("[deData] err", err)
	}
	dataHash2 := utils.GenerateDataHash(deData + ":" + timeVal)
	newEncodeData, _ := utils.AesEncrypt(sharedSecret, deData)

	fmt.Println("encodeData1", encData)
	fmt.Println("encodeData2", newEncodeData)
	fmt.Println("deData=", deData)
	fmt.Println("dataHash1=", dataHash)
	fmt.Println("dataHash2=", dataHash2)
}

func TestLen(t *testing.T) {
	recBody := "{\"nodes\":[{\"region\":\"ASIA\",\"host\":\"192.168.31.90\",\"tls\":\"OFF\",\"port\":5001,\"type\":\"API_GATEWAY\"},{\"region\":\"ASIA\",\"host\":\"static.ducloud.buzz\",\"tls\":\"ON\",\"port\":443,\"type\":\"STATIC_URL\"},{\"region\":\"ASIA\",\"host\":\"192.168.31.90\",\"tls\":\"OFF\",\"port\":5005,\"type\":\"SOCKET_API\"}]}"

	var recParsed interface{}
	err := json.Unmarshal([]byte(recBody), &recParsed)
	if err != nil {
		fmt.Println("error", err)
	}
	response := middlewares.Response{
		Code:    200,
		Message: "ok",
		Data:    recParsed,
	}
	responseBytes, _ := json.Marshal(&response)
	responseStr := string(responseBytes)
	fmt.Println("responseStr", responseStr)
	// enRepData, _ := AesEncrypt(sharedSecret, responseStr)

}

func TestAes(t *testing.T) {
	// "4470066a8095a4ea6f54135d"
	// da4483b7175307d5667ec4fa92d96d5b0c33c30c34a800da0337
	// e028ac26b354f94c13b7b40861461d2fe4ee2841a7bb8f5ec6e43f2e9f0f267ea91303332597
	encode := "e028ac26b354f94c13b7b40861461d2fe4ee2841a7bb8f5ec6e43f2e9f0f267ea91303332597"
	deData, err := utils.AesDecrypt("1234567890123456", encode)
	if err != nil {
		fmt.Println("[deData] err", err)
	}
	fmt.Println(deData)
	e1, _ := utils.AesEncrypt("1234567890123456", deData)
	fmt.Println("e1", e1)
	d2, _ := utils.AesDecrypt("1234567890123456", e1)
	fmt.Println("d2=", d2)
}
