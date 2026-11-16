# Adds InfoPlist.strings (why the phone asks for each permission, in English and Spanish) to the
# iOS app target, once. Kept so the change to the Xcode project can be read and repeated; it does
# nothing if the file is already there.
#
#   GEM_HOME=<CocoaPods' own gems> ruby tools/add-permission-words.rb     (from app/)
#
# It uses the `xcodeproj` library that CocoaPods brings, so the project file is never edited by
# hand. It sets no team and no signing identity.
require 'xcodeproj'

path = File.join(__dir__, '..', 'ios', 'App', 'App.xcodeproj')
project = Xcodeproj::Project.open(path)
app = project.targets.find { |t| t.name == 'App' } or abort('The App target is missing.')
group = project.main_group['App'] or abort('The App group is missing.')
file = 'InfoPlist.strings'
if group.children.any? { |c| c.display_name == file }
  puts 'Nothing to add.'
else
  strings = group.new_variant_group(file)
  %w[en es].each do |lang|
    ref = strings.new_file("#{lang}.lproj/#{file}")
    ref.name = lang
  end
  app.resources_build_phase.add_file_reference(strings)
  project.save
  puts "Added #{file}."
end
