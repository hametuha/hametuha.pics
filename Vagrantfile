# -*- mode: ruby -*-
# vi: set ft=ruby :

require 'yaml'

HAMETUHA_CONFIG = {
  :ip => '192.168.33.24', #IP アドレス
  :box => 'opscode-centos-7.0', # ボックスファイル。事前にインストールしておくこと
  :host_name => 'local.hametuha.pics', # サイトのホスト名
  :vagrant_dir => '/var/www/app', # Vagrantのルートディレクトリ。変更の必要なし
}


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
        :version => '6.11.0',
        :install_method => 'binary',
        :binary => {
          :checksum => {
            :linux_x86 => '790cae8d5055aa174f2121d2ebb31bc08620d82fb5b7b9707df0859d2b24d869',
            :linux_x64 => '2b0e1b06bf8658ce02c16239eb6a74b55ad92d4fb7888608af1d52b383642c3c',
          }
        }
      }
    }

    # Register recipes to run
    chef.run_list = %w[
      recipe[selinux::disabled]
      recipe[iptables::disabled]
      recipe[yum-ius]
      recipe[sc-mongodb::default]
      recipe[nginx]
      recipe[nodejs]
    ]
    chef.run_list += %w[
      recipe[hamepic]
      recipe[hamepic::setup]
    ]
  end

end
