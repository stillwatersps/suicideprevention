# Adds the Tidelight watch app to the iOS project as its own target, once. It was run on November
# 15, 2026; it is kept so the change to the Xcode project can be read and repeated, and it does
# nothing if the target is already there.
#
#   GEM_HOME=<CocoaPods' own gems> ruby tools/add-watch-target.rb     (from app/)
#
# It uses the `xcodeproj` library that CocoaPods brings, so the project file is never edited by
# hand. It sets no team and no signing identity: those stay a founder's to choose in Xcode.
require 'xcodeproj'

path = File.join(__dir__, '..', 'ios', 'App', 'App.xcodeproj')
project = Xcodeproj::Project.open(path)
name = 'TidelightWatch'
if project.targets.any? { |t| t.name == name }
  puts "#{name} is already in the project. Nothing changed."
  exit 0
end

app = project.targets.find { |t| t.name == 'App' } or abort('The App target is missing.')
app_settings = app.build_configurations.first.build_settings
app_id = app_settings['PRODUCT_BUNDLE_IDENTIFIER']

watch = project.new_target(:application, name, :watchos, '10.0', nil, :swift)
group = project.main_group.new_group(name, name)
watch.add_file_references([group.new_file('TidelightWatchApp.swift')])
watch.resources_build_phase.add_file_reference(group.new_file('Assets.xcassets'))
strings = group.new_variant_group('Localizable.strings')
%w[en es].each do |lang|
  ref = strings.new_file("#{lang}.lproj/Localizable.strings")
  ref.name = lang
end
watch.resources_build_phase.add_file_reference(strings)

watch.build_configurations.each do |config|
  s = config.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER'] = "#{app_id}.watchkitapp"
  s['PRODUCT_NAME'] = '$(TARGET_NAME)'
  s['SDKROOT'] = 'watchos'
  s['TARGETED_DEVICE_FAMILY'] = '4'
  s['WATCHOS_DEPLOYMENT_TARGET'] = '10.0'
  s['SWIFT_VERSION'] = '5.0'
  s['GENERATE_INFOPLIST_FILE'] = 'YES'
  s['INFOPLIST_KEY_CFBundleDisplayName'] = 'Tidelight'
  s['INFOPLIST_KEY_WKApplication'] = 'YES'
  s['INFOPLIST_KEY_WKCompanionAppBundleIdentifier'] = app_id
  s['ASSETCATALOG_COMPILER_APPICON_NAME'] = 'AppIcon'
  s['ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME'] = 'AccentColor'
  s['MARKETING_VERSION'] = app_settings['MARKETING_VERSION'] || '1.0'
  s['CURRENT_PROJECT_VERSION'] = app_settings['CURRENT_PROJECT_VERSION'] || '1'
  s['CODE_SIGN_STYLE'] = 'Automatic'
  s['SKIP_INSTALL'] = 'YES'
  s['SWIFT_EMIT_LOC_STRINGS'] = 'YES'
  s['LD_RUNPATH_SEARCH_PATHS'] = ['$(inherited)', '@executable_path/Frameworks']
  s.delete('IPHONEOS_DEPLOYMENT_TARGET')
end

# The phone app carries the watch app inside it.
app.add_dependency(watch)
embed = app.new_copy_files_build_phase('Embed Watch Content')
embed.dst_subfolder_spec = '16'
embed.dst_path = '$(CONTENTS_FOLDER_PATH)/Watch'
build_file = embed.add_file_reference(watch.product_reference)
build_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }

regions = project.root_object.known_regions
project.root_object.known_regions = (regions + ['es']).uniq

project.save
puts "Added #{name} (#{app_id}.watchkitapp) to the project."
