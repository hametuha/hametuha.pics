#
# Cookbook Name:: hamepic
# Recipe:: setup
#
# Copyright 2015, Hametuha INC.
#
# License MIT
#

#
# Firewall
# --------------------
#
execute 'npm-init' do
  user 'root'
  cwd node[:base_dir]
  command 'firewall-cmd --permanent --zone=public --add-service=http && firewall-cmd --reload'
end

#
# Reload postfix
# --------------------
#
# Reload post fix
execute "postfix_reload" do
  command "/usr/sbin/postfix reload"
  user "root"
end

