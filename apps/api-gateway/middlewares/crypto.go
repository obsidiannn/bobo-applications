package middlewares

import (
	"bobo/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	"github.com/caddyserver/caddy/v2/caddyconfig/httpcaddyfile"
	"github.com/caddyserver/caddy/v2/modules/caddyhttp"
	"go.uber.org/zap"
)

type CryptoMiddleware struct {
}

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// CaddyModule returns the Caddy module information.
func (CryptoMiddleware) CaddyModule() caddy.ModuleInfo {
	return caddy.ModuleInfo{
		ID:  "http.handlers.bobo_crypto_middleware",
		New: func() caddy.Module { return new(CryptoMiddleware) },
	}
}

// parseCaddyfile 解析 Caddyfile 中的指令
func parseCaddyfile(h httpcaddyfile.Helper) (caddyhttp.MiddlewareHandler, error) {
	return CryptoMiddleware{}, nil
}

// Provision 设置中间件，在此处读取和处理 JSON 配置
func (m *CryptoMiddleware) Provision(ctx caddy.Context) error {
	// 可以在此进行一些初始化操作
	caddy.Log().Info("Provisioning MyMiddleware with setting: ")
	return nil
}

var caddy_loger = caddy.Log()
var bufPool = sync.Pool{
	New: func() interface{} {
		return new(bytes.Buffer)
	},
}

func (cm CryptoMiddleware) ServeHTTP(w http.ResponseWriter, r *http.Request, next caddyhttp.Handler) error {
	// Read the request body
	encData, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return err
	}
	defer r.Body.Close()

	sign := r.Header.Get("x-req-sign")
	timeVal := r.Header.Get("x-req-time")
	dataHash := r.Header.Get("x-req-data-hash")
	pubKey := r.Header.Get("x-req-pub-key")

	if sign == "" {
		http.Error(w, "x-req-sign is empty", http.StatusBadRequest)
		return fmt.Errorf("x-req-sign is empty")
	}
	if timeVal == "" {
		http.Error(w, "x-req-time is empty", http.StatusBadRequest)
		return fmt.Errorf("x-req-time is empty")
	}
	if dataHash == "" {
		http.Error(w, "x-req-data-hash is empty", http.StatusBadRequest)
		return fmt.Errorf("x-req-data-hash is empty")
	}
	if pubKey == "" {
		http.Error(w, "x-req-pub-key is empty", http.StatusBadRequest)
		return fmt.Errorf("x-req-pub-key is empty")
	}

	address, _ := utils.RecoverAddress(dataHash, sign)
	r.Header.Add("x-req-data-hash", dataHash)
	r.Header.Add("x-req-addr", address)
	r.Header.Add("reqAddr", address)
	r.Header.Add("reqPubKey", pubKey)

	wallet, _ := utils.GetWallet()

	sharedSecret, _ := wallet.ComputeSharedSecret(pubKey)
	encDataStr := string(encData)
	caddy_loger.Info("[sharedSecret]", zap.String("sharedSecret", sharedSecret), zap.String("encDataStr", encDataStr))

	deData, _ := utils.AesDecrypt(sharedSecret, encDataStr)
	dataHash2 := utils.GenerateDataHash(deData + ":" + timeVal)
	if dataHash != dataHash2 {
		http.Error(w, "data hash error", http.StatusBadRequest)
		return fmt.Errorf("data hash error")
	}

	time2, _ := strconv.ParseInt(timeVal, 10, 64)
	currentStamp := time.Now().Unix()
	if time2 < currentStamp-1000*60*60*24*7 {
		http.Error(w, "time error", http.StatusBadRequest)
		return fmt.Errorf("time error")
	}
	// change body f791ab9740da1dc259308c4ad272b2ba
	caddy_loger.Info("[request]", zap.String("deData", deData))
	deDataBytes := []byte(deData)
	contentLen := strconv.Itoa(len(deData))
	r.Body = io.NopCloser(bytes.NewBuffer(deDataBytes))
	r.ContentLength = int64(len(deData))
	r.Header.Set("Content-Length", contentLen)
	r.Header.Set("Content-Type", "application/json")

	buf := bufPool.Get().(*bytes.Buffer)
	buf.Reset()
	defer bufPool.Put(buf)

	rr := caddyhttp.NewResponseRecorder(w, buf, func(status int, header http.Header) bool {
		// Modify the headers before sending the response if needed
		return true
	})

	// Call next middleware
	if err := next.ServeHTTP(rr, r); err != nil {
		return err
	}
	// Process the recorded response body
	recBody := rr.Buffer().String()
	var recParsed interface{}
	json.Unmarshal([]byte(recBody), &recParsed)

	caddy_loger.Info("[response]", zap.String("responseBody", recBody))
	response := Response{
		Code:    rr.Status(),
		Message: "ok",
		Data:    recParsed,
	}
	responseBytes, _ := json.Marshal(response)
	responseStr := string(responseBytes)
	enRepData, _ := utils.AesEncrypt(sharedSecret, responseStr)

	repTime := fmt.Sprint(time.Now().Unix())
	repDataHash := utils.GenerateDataHash(responseStr + ":" + repTime)
	repDataSign := wallet.SignMessage(repDataHash)

	w.Header().Set("Content-Type", "text/plain")
	w.Header().Set("X-Rep-Data-Hash", repDataHash)
	w.Header().Set("X-Rep-Time", repTime)
	w.Header().Set("X-Rep-Sign", repDataSign)
	w.Header().Set("Content-Length", strconv.Itoa(len(enRepData)))

	w.WriteHeader(rr.Status())
	i, err := w.Write([]byte(enRepData))
	caddy_loger.Info("[finish]", zap.Int("i", i), zap.Error(err))
	return err
}

func (cm *CryptoMiddleware) UnmarshalCaddyfile(d *caddyfile.Dispenser) error {
	// No config needed for this example
	return nil
}
func init() {
	caddy.RegisterModule(CryptoMiddleware{})
}
