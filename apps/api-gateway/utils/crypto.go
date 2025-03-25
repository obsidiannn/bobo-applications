package utils

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"io"
	"strings"
	"sync"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

const MessagePrefix string = "\x19Ethereum Signed Message:\n"

func validHexString(hexStr string) string {
	if strings.HasPrefix(hexStr, "0x") {
		hexStr = hexStr[2:]
	}
	return hexStr
}

// 还原 address
func RecoverAddress(dataHash string, sign string) (string, error) {
	hash := []byte(dataHash)
	sig := hexutil.MustDecode(sign)
	if sig[crypto.RecoveryIDOffset] == 27 || sig[crypto.RecoveryIDOffset] == 28 {
		sig[crypto.RecoveryIDOffset] -= 27 // Transform yellow paper V from 27/28 to 0/1
	}
	// digest := HashMessage(hash)
	digest, _ := accounts.TextAndHash(hash)
	pubKey, err := crypto.SigToPub(digest, sig)
	if err != nil {
		return "", fmt.Errorf("invalid pubkey: %v", err)
	}
	addr := crypto.PubkeyToAddress(*pubKey)
	return strings.ToLower(addr.Hex()), nil
}

func GenerateDataHash(val string) string {
	// 创建SHA-256 hash
	hashBytes := sha256.Sum256([]byte(val))
	temp := fmt.Sprintf("%x\n", hashBytes)[:16]
	result, _ := accounts.TextAndHash([]byte(temp))
	return hexutil.Encode(result)
}

type Wallet struct {
	pk      []byte
	ecdsaPk *ecdsa.PrivateKey
}

var once sync.Once
var wallet *Wallet

func GetWallet() (Wallet, error) {
	once.Do(func() {
		// pk := os.Getenv("SERVER_PRIVATE_KEY")
		pk := "0x5714178cd10822e97030b8fdee218833e51abbe5c5623ae771c930e1f2c65a1d"
		if len(pk) > 0 {
			// keyBytes, err := hex.DecodeString(pk)
			// if err != nil {
			// 	panic("pk error")
			// }
			keyBytes := hexutil.MustDecode(pk)
			ecdsaPk, _ := crypto.ToECDSA(keyBytes)
			// privateKey, err := ecdh.X25519().NewPrivateKey(keyBytes)

			// crypto.load
			wallet = &Wallet{pk: keyBytes, ecdsaPk: ecdsaPk}
		}
	})
	if wallet == nil {
		return Wallet{}, fmt.Errorf("wallet error")
	}
	return *wallet, nil
}

func (w *Wallet) ComputeSharedSecret(pubKey string) (string, error) {
	pubKeyBytes := hexutil.MustDecode(pubKey)
	pubKeyObj, _ := crypto.DecompressPubkey(pubKeyBytes)
	x2, y2 := crypto.S256().ScalarMult(pubKeyObj.X, pubKeyObj.Y, w.pk)

	/**
		toHex(isCompressed = true) {
	        const { x, y } = this.aff(); // convert to 2d xy affine point
	        const head = isCompressed ? ((y & 1n) === 0n ? '02' : '03') : '04'; // 0x02, 0x03, 0x04 prefix
	        return head + n2h(x) + (isCompressed ? '' : n2h(y)); // prefix||x and ||y
	    }
	*/
	sharedSecret := x2.Text(16) + y2.Text(16)
	return "0x04" + sharedSecret, nil
	// return hexutil.Encode(sharedSecret), nil
}

func (w *Wallet) SignMessage(val string) string {
	message, _ := hex.DecodeString(val)
	hash := HashMessage(message)
	signature, _ := crypto.Sign(hash, w.ecdsaPk)
	signature[64] += 27

	return hex.EncodeToString(signature)
}

func HashMessage(message []byte) []byte {
	msg := []uint8(message)
	binPrefix := []byte(MessagePrefix)
	fmt.Println(hexutil.Encode(binPrefix)[2:])
	fmt.Println(len(msg))
	fmt.Println(hexutil.Encode([]byte(fmt.Sprint(len(msg)))))
	val := "0x" + hexutil.Encode(binPrefix)[2:] + hexutil.Encode([]byte(fmt.Sprint(len(message))))[2:] + hexutil.Encode(message)[2:]
	fmt.Println("[pre]", val)
	hash := crypto.Keccak256(
		binPrefix,
		[]byte(fmt.Sprint(len(message))),
		message)
	return hash
}

/*
PKCS7Padding 填充模式
text：明文内容
blockSize：分组块大小
*/
func PKCS7Padding(text []byte, blockSize int) []byte {
	// 计算待填充的长度
	padding := blockSize - len(text)%blockSize
	var paddingText []byte
	if padding == 0 {
		// 已对齐，填充一整块数据，每个数据为 blockSize
		paddingText = bytes.Repeat([]byte{byte(blockSize)}, blockSize)
	} else {
		// 未对齐 填充 padding 个数据，每个数据为 padding
		paddingText = bytes.Repeat([]byte{byte(padding)}, padding)
	}
	return append(text, paddingText...)
}

/*
去除 PKCS7Padding 填充的数据
text 待去除填充数据的原文
*/
func UnPKCS7Padding(text []byte) []byte {
	// 取出填充的数据 以此来获得填充数据长度
	unPadding := int(text[len(text)-1])
	return text[:(len(text) - unPadding)]
}

func aesKey(key string) []byte {
	hash := sha256.Sum256([]byte(key))
	return hash[:32]
}

// Encrypt 加密函数，使用 AES-128-CBC 模式进行加密
func AesEncrypt(key string, plaintext string) (string, error) {
	originalBytes := []byte(plaintext)
	keyBytes := []byte(aesKey(key))

	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, 12)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		panic(err.Error())
	}
	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		panic(err.Error())
	}
	ciphertext := aesgcm.Seal(nonce, nonce, originalBytes, nil)

	// paddedPlaintext := PKCS7Padding(originalBytes, block.BlockSize())
	// ciphertext := make([]byte, len(paddedPlaintext))
	// mode := cipher.NewCBCEncrypter(block, ivBytes)
	// mode.CryptBlocks(ciphertext, paddedPlaintext)
	return hex.EncodeToString(ciphertext), nil
}

// Decrypt 解密函数，使用 AES-128-CBC 模式进行解密
//
//	func AesDecrypt(key string, hexCiphertext string) (string, error) {
//		ciphertext, err := hex.DecodeString(hexCiphertext)
//		ivBytes := []byte(aesIv(key))
//		block, err := aes.NewCipher(ivBytes)
//		if err != nil {
//			return "", err
//		}
//		blockMode := cipher.NewCBCDecrypter(block, ivBytes)
//		result := make([]byte, len(ciphertext))
//		blockMode.CryptBlocks(result, ciphertext)
//		// 去除填充
//		result = UnPKCS7Padding(result)
//		return string(result), nil
//	}
func AesDecrypt(key string, hexCiphertext string) (string, error) {
	ciphertext, _ := hex.DecodeString(hexCiphertext)
	ivBytes := ciphertext[:12]
	keyBytes := []byte(aesKey(key))
	// fmt.Println("iv=", hex.EncodeToString(ivBytes))
	// fmt.Println("key=", hex.EncodeToString(keyBytes))
	// authTag := ciphertext[len(ciphertext)-16:]
	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		panic(err.Error())
	}
	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		panic(err.Error())
	}
	plaintext, err := aesgcm.Open(nil, ivBytes, ciphertext[12:], nil)
	if err != nil {
		panic(err.Error())
	}
	return string(plaintext), nil
}
func IntToBytes(n int) []byte {
	data := int64(n)
	bytebuf := bytes.NewBuffer([]byte{})
	binary.Write(bytebuf, binary.BigEndian, data)
	return bytebuf.Bytes()
}
