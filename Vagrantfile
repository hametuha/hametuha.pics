# -*- mode: ruby -*-
# vi: set ft=ruby :

require 'yaml'

# 以下を編集。
HAMETUHA_CONFIG = {
  :host_name       => 'local.hametuha.pics', # クライアントサイトのホスト名
  :wp_host         => 'takahashifumiki.info', # ホストとなるWordPressのドメイン。
  :wp_url          => 'https://takahashifumiki.info', # ホストとなるWordPressのURL
  :consumer_key    => 'ikjTnbUBsTsC', # 作成したコンシューマーキー
  :consumer_secret => 'dihm2jxs0WVr70OFS6jZzTgEBtgWoevcvE50ao7zHNVk6Bx0', # 作成したコンシューマーシークレット
}
# 編集ここまで


# ボックスファイル。事前にインストールしておくこと
HAMETUHA_CONFIG[:box] = 'opscode-centos-7.0';
# Vagrantのルートディレクトリ。変更の必要なし
HAMETUHA_CONFIG[:vagrant_dir] = '/var/www/app';
# ゲストOSのIPアドレス。 変更の必要なし
HAMETUHA_CONFIG[:ip] = '192.168.33.24';

#
# ほかに変更したい要素がある場合は、以下のブロックに書き込んでください。
#
# -------------------------------------
#




# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = HAMETUHA_CONFIG[:box]

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network "private_network", ip: HAMETUHA_CONFIG[:ip]

  # And set host name
  config.vm.hostname = HAMETUHA_CONFIG[:host_name];
  if Vagrant.has_plugin?("vagrant-hostsupdater")
    config.hostsupdater.remove_on_suspend = true
  end

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  config.vm.synced_folder "app", HAMETUHA_CONFIG[:vagrant_dir], :create => "true"

  # Enable provisioning with chef solo, specifying a cookbooks path, roles
  # path, and data_bags path (all relative to this Vagrantfile), and adding
  # some recipes and/or roles.

  # Tell vagrant to use plugins
  config.omnibus.chef_version = :latest

  # Chef set up
  config.vm.provision "chef_solo" do |chef|
    chef.cookbooks_path = ["./cookbooks", "./site-cookbooks"]
    chef.data_bags_path = "./data_bags"

    # Node attributes:
    chef.json = {
      :ip => HAMETUHA_CONFIG[:ip],
      :host_name => HAMETUHA_CONFIG[:host_name],
      :wp_host  => HAMETUHA_CONFIG[:wp_host],
      :wp_url   => HAMETUHA_CONFIG[:wp_url],
      :consumer_key => HAMETUHA_CONFIG[:consumer_key],
      :consumer_secret => HAMETUHA_CONFIG[:consumer_secret],
      :base_dir => HAMETUHA_CONFIG[:vagrant_dir],
      :doc_dir  => File.join(HAMETUHA_CONFIG[:vagrant_dir], 'public'),
      :log_dir  => "/home/vagrant/log",
      :cache_dir => "/home/vagrant/cache",
      :mongo_dir => "/home/vagrant/mongodb",
      :nginx => {
        :client_max_body_size => "5M",
        :log_dir  => "/home/vagrant/log/nginx",
        :user => 'vagrant',
        :group => 'vagrant',
        :repo_source => "nginx",
        :default_site_enabled => false,
        :sendfile => "off",
      },
      :nodejs => {
        :version => '0.12.7',
        :install_method => 'binary',
        :binary => {
          :checksum => {
            :linux_x86 => 'bccf75736b64bd175b45681ed83a020f0dcc59b3626bbcefd5f7438aed9e9c15',
            :linux_x64 => '6a2b3077f293d17e2a1e6dba0297f761c9e981c255a2c82f329d4173acf9b9d5',
          }
        }
      }
    }

    # Register recipes to run
    chef.run_list = %w[
      recipe[selinux::disabled]
      recipe[iptables::disabled]
      recipe[yum-ius]
      recipe[mongodb3::default]
      recipe[nginx]
      recipe[nodejs]
    ]
    chef.run_list += %w[
      recipe[hamepic]
      recipe[hamepic::setup]
    ]
  end

end
