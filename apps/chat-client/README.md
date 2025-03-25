## android
```
    splits {
        abi {
            reset()
            enable true
            universalApk false
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }
```

## ios
```
pre_install do |installer|
  installer.pod_targets.each do |pod|
    if pod.name.eql?('op-sqlite')
      def pod.build_type
        Pod::BuildType.static_library
      end
    end
  end
end
```


* drizzle 生成 

```
npx drizzle-kit generate
```