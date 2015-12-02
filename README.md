# はめぴくっ！

破滅派が運営しているWebサイト[はめぴくっ！](http://hametuha.pics)のソースコードです。
現在のメンテナ（[fumikito](https://github.com/fumikito)）が死亡したら困るので、公開しています。

## ライセンス

本リポジトリのすべてのソースコードには[MITライセンス](https://opensource.org/licenses/MIT)が適用されます。

## インストール

このツールでは以下の技術を利用しています。

- VirtualBox [VirtualBox Mania VirtualBoxのインストール・設定・使い方を詳しく解説](http://vboxmania.net)
- Vagrant [ダウンロード](https://www.vagrantup.com)
- [ChefDK - Chef Development Took Kit](https://downloads.chef.io/chef-dk/)
	- Chef, Chef-Solo
	- Knife
	- Berkshelf

それぞれインストールしておいてください。

### 実行準備

このリポジトリをクローンしたら、次の操作を行います。ほとんどの操作はこのリポジトリのルートディレクトリで行います。

このドキュメントでは、ルートディレクトリを ~/Documents/hametuha.pics とし、それを「ホームディレクトリ」と呼びます。

#### Vagrant boxの追加

ホームディレクトリで以下のVagrantコマンドを発行してください。

```
vagrant box add opscode-centos-7.0 http://opscode-vm-bento.s3.amazonaws.com/vagrant/virtualbox/opscode_centos-7.0_chef-provisionerless.box
```

#### Vagrant プラグインの追加

以下のプラグインをインストールしておいてください。

```
# ホストOSのhostsを書き換えてゲストOSに向けるプラグイン
vagrant plugin install vagrant-hostsupdater
# ゲストOSにChefをインストールするプラグイン
vagrant plugin install vagrant-omnibus
# Berkshelf（後述）を有効化するプラグイン
vagrant plugin install vagrant-berkshelf
```

#### セットアップ

```bash
# 依存しているCookbookをインストール
berks vendor ./cookbooks
# アップ
vagrant up
# アクセス
vagrant ssh
# ドキュメントルートへ
cd /var/www/app
# npmをインストール
npm install
# bowerをインストール
bower install
# gulpでビルド
gulp build
# アプリを開始
npm start
```

http://local.hametuha.pics へアクセスすると、ローカルサイトが始まっていません。

## 変更があった場合

以下の変更があった場合、コマンドを実行する必要があります。

#### app以下のディレクトリ

package.json に変更があった場合、 `npm install` を実行する必要があります。

#### app以外のディレクトリ

これらのファイルに変更があった場合、Vagrantが変更されている可能性が高いので、`vagrant provision`を実行してください。
それでもダメだった場合は、 `vagrant destroy -f` を実行してボックスを削除した上で、 `vagrant up` 再度実行してください。
